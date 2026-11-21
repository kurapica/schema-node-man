import type { NodeSchema } from "schema-node-core"

/** The role of a conversation turn. */
export type AIChatRole = "system" | "user" | "assistant"

/** One conversation turn supplied by the caller. */
export interface AIChatTurn {
    role: AIChatRole
    content: string
}

/** The schema the editor currently shows, used as assistant context. */
export interface AIChatTarget {
    /** The full name of the edited schema. */
    name?: string
    /** The current editor content, including unsaved modifications. */
    schema?: NodeSchema
    /** Whether the editor is creating a new schema. */
    isNew?: boolean
}

/** The per-turn generation knobs. Missing values fall back to host configuration. */
export interface AIChatGenerationOptions {
    model?: string
    temperature?: number
    maxTokens?: number
    timeoutSeconds?: number
}

/** One conversation turn going in. */
export interface AIChatRequest {
    /** The user message. */
    userContent: string
    /** An optional extra system instruction. */
    systemContent?: string
    /** The conversation identifier returned by a previous turn. */
    conversationId?: string
    /** Optional turns for a stateless caller; used only when no conversation identifier is supplied. */
    history?: AIChatTurn[]
    /** The current editor context. */
    target?: AIChatTarget
    /** The per-turn generation knobs. */
    options?: AIChatGenerationOptions
    /** Concrete validation errors from the previous attempt. */
    validationFeedback?: string
    /** The UI locale used for localized assistant text. */
    locale?: string
    /** Whether text deltas should be streamed. Implementations may ignore this flag. */
    stream?: boolean
}

/** The kind of result returned by the assistant. */
export type AIChatResultKind = "chat" | "schemaChange" | "validationFailed" | "error"

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

/** One conversation turn going out. */
export interface AIChatResult {
    /** The conversation identifier to send with the next turn. */
    conversationId: string
    kind: AIChatResultKind
    /** The natural language answer. */
    message?: string
    /** The complete normalized NodeSchema payload, suitable for a whole-node write-back. */
    schema?: NodeSchema
    /** The full change candidate, kept for previewing the diff. */
    change?: SchemaChangeCandidate
    /** The blocking validation problems. */
    errors: SchemaValidationError[]
    /** Non blocking validation findings. */
    warnings: string[]
    /** The backend computed changed JSON paths. */
    changes: string[]
    /** The tools invoked by the assistant (names only). */
    toolCalls: string[]
    /** The error code for the `error` kind. */
    errorCode?: string
}

/** The streaming callbacks and cancellation handle. */
export interface AIChatHandlers {
    signal?: AbortSignal
    onConversation?: (conversationId: string) => void
    onDelta?: (text: string) => void
}

/**
 * The transport agnostic schema assistant contract. A host consumes this interface only; the local
 * and Web API implementations both satisfy it.
 */
export interface AIChat {
    chat(request: AIChatRequest, handlers?: AIChatHandlers): Promise<AIChatResult>
}
