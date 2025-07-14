<template>
    <div class="func-arg-list" style="width: 100%;">
        <template v-if="!state.length && !state.readonly">
            <el-button type="primary" @click="argsNode.addRow()">{{ _L["schema.designer.new"] }}</el-button>
        </template>
        <div v-for="i in state.length" class="func-arg" style="display: grid; grid-template-columns: repeat(2, 48%); grid-gap: 12px">
            <el-card class="box-card" shadow="hover">
                <schema-view 
                    :key="argsNode.elements[i-1].guid"
                    :node="argsNode.elements[i-1]" 
                    :in-form="SchemaNodeFormType.Expand"
                    plain-text="left"
                ></schema-view>
                <div v-if="!state.readonly" class="bottom clearfix">
                    <el-button type="primary" @click="argsNode.addRow(i)">{{ _L["schema.designer.new"] }}</el-button>
                    <el-button type="danger" style="float: right" @click="argsNode.delRows(i - 1)">{{ _L["schema.designer.delete"] }}</el-button>
                </div>
            </el-card>
            <el-card shadow="hover">
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrayNode } from 'schema-node'
import { onMounted, onUnmounted, reactive, toRaw } from 'vue'
import { _L, SchemaNodeFormType } from 'schema-node-vue-view'
import schemaView from 'schema-node-vue-view'

const props = defineProps<{ node: ArrayNode }>()
const argsNode = toRaw(props.node)

const state = reactive({
    readonly: false,
    length: 0
})

let argsHandler: Function | undefined = undefined
let stateHandler: Function | undefined = undefined

onMounted(() => {
    argsHandler = argsNode.subscribe(() => {
        state.length = argsNode.elements.length
    }, true)

    stateHandler = argsNode.subscribeState(() => {
        state.readonly = argsNode.readonly
    }, true)
})

onUnmounted(() => {
    if (argsHandler) argsHandler()
    if (stateHandler) stateHandler()
})
</script>