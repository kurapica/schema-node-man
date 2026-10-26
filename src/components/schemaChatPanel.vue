<template>
  <div class="schema-chat">
    <div class="schema-chat__header">
      <div class="schema-chat__title">
        <span>{{ _L["frontend.ai.title"] }}</span>
        <el-tag v-if="contextLabel" size="small" type="info" effect="plain">{{ contextLabel }}</el-tag>
      </div>
      <div class="schema-chat__actions">
        <el-button link size="small" :disabled="sending" @click="reset">{{ _L["frontend.ai.reset"] }}</el-button>
        <el-button link size="small" @click="$emit('close')">{{ _L["frontend.ai.close"] }}</el-button>
      </div>
    </div>

    <div ref="scrollRef" class="schema-chat__messages">
      <div v-if="!messages.length" class="schema-chat__empty">
        {{ _L["frontend.ai.empty"] }}
      </div>

      <div v-for="item in messages" :key="item.id" class="schema-chat__message" :class="'is-' + item.role">
        <div class="schema-chat__role">{{ item.role === "user" ? _L["frontend.ai.you"] : _L["frontend.ai.assistant"] }}</div>
        <div class="schema-chat__bubble">
          <div class="schema-chat__text" :class="{ 'is-placeholder': item.streaming && !item.text }">
            {{ item.text || (item.streaming ? _L["frontend.ai.thinking"] : "") }}
            <span v-if="item.streaming && item.text" class="schema-chat__cursor">▍</span>
          </div>

          <div v-if="item.response?.toolCalls?.length" class="schema-chat__tools">
            <el-tag v-for="tool in item.response.toolCalls" :key="tool" size="small" effect="plain" type="info">
              {{ tool }}
            </el-tag>
          </div>

          <el-alert v-if="item.error" :title="item.error" type="error" :closable="false" show-icon class="schema-chat__alert" />

          <div v-if="item.response?.change" class="schema-chat__candidate">
            <div class="schema-chat__candidate-head">
              <el-tag size="small" :type="item.response.change.operation === 'create' ? 'success' : 'warning'">
                {{ item.response.change.operation === "create" ? _L["frontend.ai.candidate.create"] : _L["frontend.ai.candidate.update"] }}
              </el-tag>
              <span class="schema-chat__candidate-name">{{ getCandidateFullName(item.response.change) }}</span>
              <el-tag size="small" :type="item.response.change.isValid ? 'success' : 'danger'">
                {{ item.response.change.isValid ? _L["frontend.ai.candidate.valid"] : _L["frontend.ai.candidate.invalid"] }}
              </el-tag>
            </div>

            <div v-if="item.response.change.summary" class="schema-chat__candidate-summary">
              {{ item.response.change.summary }}
            </div>

            <div v-if="item.response.change.changes?.length" class="schema-chat__section">
              <div class="schema-chat__section-title">{{ _L["frontend.ai.changes"] }}</div>
              <ul class="schema-chat__change-list">
                <li v-for="change in item.response.change.changes" :key="change">{{ change }}</li>
              </ul>
            </div>

            <div v-if="item.response.change.errors?.length" class="schema-chat__section">
              <div class="schema-chat__section-title">{{ _L["frontend.ai.errors"] }}</div>
              <el-alert v-for="(error, index) in item.response.change.errors" :key="index"
                :title="(error.path ? error.path + ': ' : '') + error.message" type="error" :closable="false" show-icon
                class="schema-chat__alert" />
            </div>

            <div v-if="item.response.change.warnings?.length" class="schema-chat__section">
              <div class="schema-chat__section-title">{{ _L["frontend.ai.warnings"] }}</div>
              <el-alert v-for="(warning, index) in item.response.change.warnings" :key="index" :title="warning"
                type="warning" :closable="false" show-icon class="schema-chat__alert" />
            </div>

            <el-collapse class="schema-chat__preview">
              <el-collapse-item :title="_L['frontend.ai.preview']" :name="item.id">
                <pre>{{ formatCandidateSchema(item.response.change) }}</pre>
              </el-collapse-item>
            </el-collapse>

            <div class="schema-chat__apply">
              <el-button type="primary" size="small" :loading="item.applying"
                :disabled="!item.response.change.isValid || item.applied" @click="applyCandidate(item)">
                {{ item.applied ? _L["frontend.ai.appliedbutton"] : (item.applying ? _L["frontend.ai.applying"] : _L["frontend.ai.apply"]) }}
              </el-button>
              <span v-if="item.applied" class="schema-chat__applied-hint">{{ _L["frontend.ai.applied"] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="schema-chat__composer">
      <el-input v-model="input" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" resize="none"
        :placeholder="_L['frontend.ai.placeholder']" :disabled="sending" @keydown="onKeydown" />
      <div class="schema-chat__composer-actions">
        <el-button v-if="sending" size="small" @click="stop">{{ _L["frontend.ai.stop"] }}</el-button>
        <el-button type="primary" size="small" :loading="sending" :disabled="!input.trim()" @click="send">
          {{ _L["frontend.ai.send"] }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue"
import { _L } from "schema-node-vue-view"
import {
  chatSchema,
  SchemaChatStreamUnavailableError,
  streamSchemaChat,
} from "../ai/schemaChatApi"
import type { SchemaChangeCandidate, SchemaChatContext, SchemaChatResponse } from "../ai/schemaChatApi"
import { checkCandidate, formatCandidateSchema, getCandidateFullName } from "../ai/schemaCandidate"

interface ChatItem {
  id: string
  role: "user" | "assistant"
  text: string
  streaming?: boolean
  response?: SchemaChatResponse
  error?: string
  applied?: boolean
  applying?: boolean
}

const props = defineProps<{
  visible: boolean
  contextProvider: () => SchemaChatContext | Promise<SchemaChatContext>
  applyCandidate: (change: SchemaChangeCandidate) => Promise<{ ok: boolean, error?: string }>
}>()

const emit = defineEmits<{ (e: "close"): void }>()

const messages = ref<ChatItem[]>([])
const input = ref("")
const sending = ref(false)
const conversationId = ref<string>()
const contextLabel = ref("")
const scrollRef = ref<HTMLElement>()

let abortController: AbortController | undefined
let nextId = 0

const newItem = (role: "user" | "assistant", text = ""): ChatItem => ({
  id: `ai-${Date.now()}-${nextId++}`,
  role,
  text,
})

const scrollToBottom = async () => {
  await nextTick()
  const element = scrollRef.value
  if (element) element.scrollTop = element.scrollHeight
}

const refreshContextLabel = async () => {
  try {
    const context = await props.contextProvider()
    const schema = context.currentSchema as any
    contextLabel.value = context.target || (schema?.name ? `${schema.namespace ? schema.namespace + "." : ""}${schema.name}` : "")
  } catch {
    contextLabel.value = ""
  }
}

watch(() => props.visible, async (visible) => {
  if (visible) {
    await refreshContextLabel()
    await scrollToBottom()
    return
  }

  abort()
})

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Enter" || event.shiftKey) return
  event.preventDefault()
  send()
}

const send = async () => {
  const text = input.value.trim()
  if (!text || sending.value) return

  let context: SchemaChatContext = {}
  try {
    context = await props.contextProvider()
  } catch (ex: any) {
    messages.value.push({ ...newItem("assistant"), error: errorText(ex) })
    return
  }

  const userItem = newItem("user", text)
  const assistantItem = newItem("assistant")
  assistantItem.streaming = true
  messages.value.push(userItem, assistantItem)
  input.value = ""
  sending.value = true
  abortController = new AbortController()

  const request = {
    message: text,
    conversationId: conversationId.value,
    target: context.target,
    currentSchema: context.currentSchema,
    isNew: context.isNew,
  }

  let streamed = ""
  try {
    let response: SchemaChatResponse
    try {
      response = await streamSchemaChat(request, {
        signal: abortController.signal,
        onConversation: (id) => { conversationId.value = id },
        onDelta: (delta) => {
          streamed += delta
          assistantItem.text = streamed
          void scrollToBottom()
        },
      })
    } catch (ex: any) {
      if (!(ex instanceof SchemaChatStreamUnavailableError)) throw ex

      // The host did not map the streaming endpoint; use the regular schema API instead.
      response = await chatSchema(request)
    }

    if (abortController?.signal.aborted) {
      assistantItem.streaming = false
      return
    }

    conversationId.value = response.conversationId || conversationId.value
    assistantItem.streaming = false
    assistantItem.response = response
    assistantItem.text = response.message || streamed
    if (response.kind === "error" && !assistantItem.error) {
      assistantItem.error = response.message || _L.value["frontend.ai.error"]
    }
    if (response.kind === "chat" && !assistantItem.text) {
      assistantItem.text = _L.value["frontend.ai.nochange"]
    }
  } catch (ex: any) {
    assistantItem.streaming = false
    if (ex?.name === "AbortError") {
      assistantItem.text = streamed || _L.value["frontend.ai.aborted"]
      return
    }
    assistantItem.error = errorText(ex)
  } finally {
    sending.value = false
    abortController = undefined
    await scrollToBottom()
  }
}

const applyCandidate = async (item: ChatItem) => {
  const change = item.response?.change
  if (!change) return

  const checked = checkCandidate(change)
  if (!checked.ok) {
    item.error = checked.error
    return
  }

  item.applying = true
  item.error = undefined
  try {
    const result = await props.applyCandidate(change)
    if (result.ok) item.applied = true
    else item.error = result.error || _L.value["frontend.ai.error"]
  } catch (ex: any) {
    item.error = errorText(ex)
  } finally {
    item.applying = false
    await nextTick()
    await scrollToBottom()
  }
}

const abort = () => {
  abortController?.abort()
  abortController = undefined
  sending.value = false
  for (const item of messages.value) {
    if (item.streaming) item.streaming = false
  }
}

const stop = () => {
  abort()
}

const reset = () => {
  abort()
  messages.value = []
  conversationId.value = undefined
  input.value = ""
}

const errorText = (ex: any): string => {
  if (!ex) return _L.value["frontend.ai.error"]
  if (typeof ex === "string") return ex
  return ex.message || String(ex)
}

onBeforeUnmount(() => abort())
</script>

<style scoped>
.schema-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--app-surface);
  color: var(--app-text);
}

.schema-chat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--app-border);
}

.schema-chat__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.schema-chat__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.schema-chat__messages {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schema-chat__empty {
  color: var(--app-text);
  opacity: 0.65;
  font-size: 0.875rem;
  padding: 1rem 0;
}

.schema-chat__message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 100%;
}

.schema-chat__message.is-user {
  align-items: flex-end;
}

.schema-chat__role {
  font-size: 0.75rem;
  opacity: 0.65;
}

.schema-chat__bubble {
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  background: var(--app-surface-muted);
  max-width: 100%;
  word-break: break-word;
}

.schema-chat__message.is-user .schema-chat__bubble {
  background: color-mix(in srgb, var(--app-link) 12%, var(--app-surface));
}

.schema-chat__text {
  white-space: pre-wrap;
  line-height: 1.55;
  font-size: 0.875rem;
}

.schema-chat__text.is-placeholder {
  opacity: 0.65;
}

.schema-chat__cursor {
  animation: schema-chat-blink 1s steps(2, start) infinite;
}

@keyframes schema-chat-blink {
  to { visibility: hidden; }
}

.schema-chat__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.schema-chat__alert {
  margin-top: 0.5rem;
}

.schema-chat__candidate {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--app-border);
}

.schema-chat__candidate-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.schema-chat__candidate-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8rem;
  flex: 1 1 auto;
}

.schema-chat__candidate-summary {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  white-space: pre-wrap;
}

.schema-chat__section {
  margin-top: 0.6rem;
}

.schema-chat__section-title {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.75;
  margin-bottom: 0.25rem;
}

.schema-chat__change-list {
  margin: 0;
  padding-left: 1.1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.5;
}

.schema-chat__preview {
  margin-top: 0.6rem;
  border-top: none;
}

.schema-chat__preview pre {
  margin: 0;
  padding: 0.5rem;
  max-height: 260px;
  overflow: auto;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 6px;
  font-size: 0.75rem;
  line-height: 1.4;
}

.schema-chat__apply {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.schema-chat__applied-hint {
  font-size: 0.75rem;
  opacity: 0.7;
}

.schema-chat__composer {
  flex: 0 0 auto;
  border-top: 1px solid var(--app-border);
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schema-chat__composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
