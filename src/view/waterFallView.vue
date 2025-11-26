<template>
    <section style="width:98%;">
        <section style="width:100%;border:1px solid #dcdfe6;border-radius:4px; padding: 1rem; margin-bottom: 1rem;" v-for="i in state.length">
            <el-button type="danger" @click="arrayNode.delRows(i - 1)" style="float:right;margin-left: 1rem;">{{ _L["DEL"] }}</el-button>
            <schema-view
                :key="node.elements[i-1].guid"
                :node="node.elements[i-1]"
                in-form="expandall"
                :plain-text="plainText"
                v-bind="$attrs"
            ></schema-view>
        </section>
        <el-button type="success" @click="arrayNode.addRow()">{{ _L["ADD"] }}</el-button>
    </section>
</template>

<script lang="ts" setup>
import { ArrayNode } from 'schema-node'
import { _L, schemaView } from 'schema-node-vueview'
import { onUnmounted, reactive, toRaw } from 'vue'

const props = defineProps<{ node: ArrayNode, plainText?: any, inForm?: any }>()
const arrayNode = toRaw(props.node)
const state = reactive({
    length: 0
})

const handler = arrayNode.subscribe(() => {
    state.length = arrayNode.elements.length
}, true)

onUnmounted(() => {
    handler()
})
</script>