<template>
    <section style="width:98%;">
        <section style="width:100%;border:1px solid #dcdfe6;border-radius:4px; padding: 1rem; margin-bottom: 1rem;" v-for="i in state.length">
            <el-button v-if="!state.readonly" type="danger" @click="arrayNode.delRows(i - 1)" style="float:right;margin-left: 1rem;">{{ _L["DEL"] }}</el-button>
            <schema-view
                v-if="node.elements[i-1]"
                :key="node.elements[i-1].guid"
                :node="node.elements[i-1]"
                in-form="expandall"
                :plain-text="plainText"
                no-add no-del
                v-bind="$attrs"
            ></schema-view>
        </section>
        <el-button v-if="!state.readonly" type="success" @click="arrayNode.addRow()">{{ _L["ADD"] }}</el-button>
    </section>
</template>

<script lang="ts" setup>
import { ArrayNode, clearDebounce, debounce, StructNode } from 'schema-node'
import { _L, schemaView } from 'schema-node-vueview'
import { h, onUnmounted, reactive, toRaw } from 'vue'

const props = defineProps<{ node: ArrayNode, plainText?: any, inForm?: any }>()
const arrayNode = toRaw(props.node)
const state = reactive({
    readonly: false,
    length: 0
})

// workflow data watcher
interface IWorkflowHandler { guid: string, name: Function, type: Function }
const clearWorkflowHandler = (h: IWorkflowHandler | undefined) => {
    h?.name()
    h?.type()
}
const workflowHandlers: IWorkflowHandler[] = []

const refreshWorkflows = () => {
    
}

const soonRefresh = debounce(refreshWorkflows, 50)
const delayRefresh = debounce(refreshWorkflows, 1000)

let handler: Function | undefined = arrayNode.subscribe((action:string) => {
    const len = arrayNode.elements.length
    if (action !== "swap" && len == state.length) return;

    let changed = false
    state.length = arrayNode.elements.length

    // clear
    for (let i = workflowHandlers.length - 1; i >= len; i--) {
        clearWorkflowHandler(workflowHandlers.pop())
    }

    // subscribe
    arrayNode.elements.forEach((e, i) => {
        if (workflowHandlers.length > i) {
            if (workflowHandlers[i].guid === e.guid) return
            clearWorkflowHandler(workflowHandlers[i])
        }

        changed = true
        const n = e as StructNode
        workflowHandlers[i] = {
            guid: e.guid,
            name: n.getField("name").subscribe(delayRefresh),
            type: n.getField("type").subscribe(refreshWorkflows)
        }
    })

    // refresh if changed
    if (changed) return soonRefresh()
}, true)

let stateHandler: Function | undefined = arrayNode.subscribeState(() => {
    state.readonly = arrayNode.readonly || false
}, true)

onUnmounted(() => {
    workflowHandlers.forEach(clearWorkflowHandler)
    workflowHandlers.length = 0

    if (handler) handler()
    if (stateHandler) stateHandler()
    handler = undefined
    stateHandler = undefined
    clearDebounce(soonRefresh)
    clearDebounce(delayRefresh)
})
</script>