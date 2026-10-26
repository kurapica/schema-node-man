import { getLanguage } from "schema-node-core"
import type { NodeSchema } from "schema-node-core"
import { getSchemaApiBaseUrl, postSchemaApi } from "schema-node-app"
import { getFrontendAuth } from "../utility/auth"

/** The result kind returned by the schema assistant. */
export type SchemaChatResultKind = "chat" | "schemaChange" | "validationFailed" | "error"

/** A validation problem reported by the server. */
export interface SchemaValidationError {
    code: string
    message: string
    path?: string
}

/** A schema change candidate returned by the assistant. */
export interface SchemaChangeCandidate {
    operation: "create" | "update" | string
    targetName: string
    /** The typed node schema. */
    schema?: NodeSchema
    /** The normalized node schema JSON, preferred for applying. */
    normalized?: NodeSchema
    summary?: string
    isValid: boolean
    errors: SchemaValidationError[]
    warnings: string[]
    /** Backend computed changed JSON paths. */
    changes: string[]
}

/** The assistant response. */
export interface SchemaChatResponse {
    conversationId: string
    kind: SchemaChatResultKind
    message?: string
    change?: SchemaChangeCandidate
    errorCode?: string
    toolCalls?: string[]
}

/** The editor context sent with a chat turn. */
export interface SchemaChatContext {
    /** The full name of the schema currently open in the editor. */
    target?: string
    /** The current editor content, including unsaved modifications. */
    currentSchema?: NodeSchema
    /** Whether the editor is creating a new schema. */
    isNew?: boolean
}

/** The chat request body. */
export interface ChatSchemaRequest extends SchemaChatContext {
    message: string
    conversationId?: string
}

/** The streaming callbacks. */
export interface SchemaChatStreamHandlers {
    onConversation?: (conversationId: string) => void
    onDelta?: (text: string) => void
    signal?: AbortSignal
}

/** Raised when the streaming endpoint is not available and the non streaming API should be used. */
export class SchemaChatStreamUnavailableError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "SchemaChatStreamUnavailableError"
    }
}

function withLocale(request: ChatSchemaRequest) {
    const body: ChatSchemaRequest & { locale?: string } = { ...request }
    const locale = getLanguage()
    if (locale && !body.locale) body.locale = locale
    return body
}

/**
 * Calls the non streaming assistant API (`/schema/chat-schema`).
 */
export async function chatSchema(request: ChatSchemaRequest): Promise<SchemaChatResponse> {
    return await postSchemaApi("/chat-schema", withLocale(request)) as SchemaChatResponse
}

/**
 * Gets the configured frontend auth headers. The streaming request bypasses axios, so the
 * existing header based authentication has to be applied explicitly.
 */
function getAuthHeaders(): Record<string, string> {
    try {
        const headers: Record<string, string> = {}
        for (const header of getFrontendAuth().headers ?? []) {
            if (header.key && header.value) headers[header.key] = header.value
        }
        return headers
    } catch {
        return {}
    }
}

/**
 * Calls the streaming assistant API (`/schema/chat-schema-stream`) and parses the server sent
 * events. Returns the final structured response. Throws
 * {@link SchemaChatStreamUnavailableError} when the endpoint is not mapped so the caller can fall
 * back to {@link chatSchema}.
 */
export async function streamSchemaChat(
    request: ChatSchemaRequest,
    handlers: SchemaChatStreamHandlers = {}
): Promise<SchemaChatResponse> {
    const base = getSchemaApiBaseUrl()
    if (!base) throw new SchemaChatStreamUnavailableError("The schema service url is not configured.")

    const url = `${base.replace(/\/$/, "")}/chat-schema-stream`
    let response: Response
    try {
        response = await fetch(url, {
            method: "POST",
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify(withLocale(request)),
            signal: handlers.signal,
        })
    } catch (ex: any) {
        if (ex?.name === "AbortError") throw ex
        throw new SchemaChatStreamUnavailableError(ex?.message || "Failed to open the assistant stream.")
    }

    if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
            throw new SchemaChatStreamUnavailableError(`The streaming endpoint is not available (${response.status}).`)
        }
        let message = `The assistant request failed (${response.status}).`
        try {
            const data = await response.json()
            message = data?.message || data?.error || message
        } catch {
            // pass
        }
        throw new Error(message)
    }

    if (!response.body) {
        throw new SchemaChatStreamUnavailableError("The browser does not support streaming responses.")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let result: SchemaChatResponse | undefined

    try {
        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            buffer = buffer.replace(/\r\n/g, "\n")

            let index = buffer.indexOf("\n\n")
            while (index >= 0) {
                const chunk = buffer.slice(0, index)
                buffer = buffer.slice(index + 2)
                index = buffer.indexOf("\n\n")

                const event = parseSseChunk(chunk)
                if (!event) continue

                const data = parseJson(event.data)
                switch (event.event) {
                    case "meta":
                        if (data?.conversationId) handlers.onConversation?.(data.conversationId)
                        break
                    case "delta":
                        if (typeof data?.text === "string") handlers.onDelta?.(data.text)
                        break
                    case "result":
                        result = data as SchemaChatResponse
                        break
                    case "error":
                        throw new Error(data?.message || "The assistant failed.")
                    default:
                        break
                }
            }
        }
    } finally {
        try { reader.releaseLock() } catch { /* pass */ }
    }

    if (!result) throw new Error("The assistant stream ended without a final result.")
    return result
}

function parseSseChunk(chunk: string): { event: string, data: string } | undefined {
    let event = "message"
    const data: string[] = []
    for (const line of chunk.split("\n")) {
        if (!line || line.startsWith(":")) continue
        if (line.startsWith("event:")) {
            event = line.substring("event:".length).trim()
        } else if (line.startsWith("data:")) {
            data.push(line.substring("data:".length).replace(/^ /, ""))
        }
    }
    if (!data.length) return undefined
    return { event, data: data.join("\n") }
}

function parseJson(text: string): any {
    if (!text) return undefined
    try {
        return JSON.parse(text)
    } catch {
        return undefined
    }
}

/** Gets the schema data that should be applied to the editor. */
export function getCandidateSchema(change?: SchemaChangeCandidate): NodeSchema | undefined {
    return (change?.normalized ?? change?.schema) as NodeSchema | undefined
}
