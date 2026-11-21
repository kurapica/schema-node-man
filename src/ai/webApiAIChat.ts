import type {
    AIChat,
    AIChatHandlers,
    AIChatRequest,
    AIChatResult,
    SchemaChangeCandidate,
} from "./aiChat"
import {
    chatSchema,
    getCandidateSchema,
    SchemaChatStreamUnavailableError,
    streamSchemaChat,
} from "./schemaChatApi"
import type { ChatSchemaRequest, SchemaChatResponse } from "./schemaChatApi"

/**
 * The Web API backed {@link AIChat} implementation. The wire protocol stays inside this module so
 * the chat UI only depends on the transport agnostic contract.
 */
export class WebApiAIChat implements AIChat {
    async chat(request: AIChatRequest, handlers: AIChatHandlers = {}): Promise<AIChatResult> {
        const wire = toWireRequest(request)

        let response: SchemaChatResponse
        try {
            response = await streamSchemaChat(wire, handlers)
        } catch (ex: any) {
            // Hosts that did not map the streaming endpoint use the regular API instead.
            if (!(ex instanceof SchemaChatStreamUnavailableError)) throw ex
            response = await chatSchema(wire)
        }

        return toResult(response)
    }
}

function toWireRequest(request: AIChatRequest): ChatSchemaRequest {
    return {
        message: request.userContent,
        conversationId: request.conversationId,
        target: request.target?.name,
        currentSchema: request.target?.schema,
        isNew: request.target?.isNew,
        systemContent: request.systemContent,
        validationFeedback: request.validationFeedback,
        history: request.history,
        modelId: request.options?.model,
        temperature: request.options?.temperature,
        maxTokens: request.options?.maxTokens,
        timeoutSeconds: request.options?.timeoutSeconds,
        locale: request.locale,
    }
}

function toResult(response: SchemaChatResponse): AIChatResult {
    const change: SchemaChangeCandidate | undefined = response.change
    return {
        conversationId: response.conversationId,
        kind: response.kind,
        message: response.message,
        schema: getCandidateSchema(change),
        change,
        errors: change?.errors ?? [],
        warnings: change?.warnings ?? [],
        changes: change?.changes ?? [],
        toolCalls: response.toolCalls ?? [],
        errorCode: response.errorCode,
    }
}

/** The default Web API implementation used by the schema editor. */
export const defaultAIChat: AIChat = new WebApiAIChat()
