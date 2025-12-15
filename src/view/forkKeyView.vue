<template>
    <el-cascader
        v-model="data"
        style="width: 100%;min-width: 120px"
        :options="state.whiteList"
        :props="{
            emitPath: false,
            checkStrictly: false,
            multiple: true,
            lazy: false
        }"
        :placeholder="node.selectPlaceHolder"
        :disabled="state.readonly || state.disable"
        :clearable="!state.require"
        v-bind="$attrs"
    ></el-cascader>
</template>

<script lang="ts" setup>
import { isNull, ArrayNode, StructNode, ScalarNode, getSchema, SchemaType, getFieldAccessWhiteList, NS_SYSTEM_STRING, NODE_SELF, type ILocaleString } from 'schema-node'
import { computed, onMounted, onUnmounted, reactive, toRaw } from 'vue'

// Define props
const props = defineProps<{ node: ArrayNode }>()
const node = toRaw(props.node)

// display state
const state = reactive<{
    data?: any,
    root?: string,
    disable?: boolean,
    require?: boolean,
    changed?: boolean,
    readonly?: boolean,
    whiteList?: any[],
}>({})

// Data
const data = computed({
    get (): any {
        return state.data
    },
    set(value: any) {
        node.data = value
    }
})

// data & state watcher
let dataWatcher: Function | null = null
let stateWatcher: Function | null = null
let payloadWatcher: Function | null = null

onMounted(() => {
    const payload = (node.parent as StructNode).getField("payload") as ScalarNode
    const display = (node.parent as StructNode).getField("display") as ScalarNode

    dataWatcher = node.subscribe(() => {
        const data = node.rawData
        state.data = data
        state.changed = node.changed
    }, true)

    stateWatcher = node.subscribeState(() => {
        state.changed = node.changed
        state.readonly = node.readonly
        state.require = node.require
        state.disable = node.rule.disable
    }, true)

    payloadWatcher = payload.subscribe(async () => {
        const val = payload.rawData
        const schema = !isNull(val) ? await getSchema(val) : undefined
        if (schema?.type === SchemaType.Struct) {
            state.whiteList = await getFieldAccessWhiteList(NS_SYSTEM_STRING, schema.struct!.fields.map(f => ({ name: f.name, type: f.type, display: f.display as ILocaleString })))
        }
        else if(schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum)
        {
            state.whiteList = await getFieldAccessWhiteList(NS_SYSTEM_STRING, [{ name: NODE_SELF, type: schema.name, display: display?.data as ILocaleString }])
        }
        else
        {
            state.whiteList = []
        }
    }, true)
})

onUnmounted(() => {
    if (dataWatcher) dataWatcher()
    if (stateWatcher) stateWatcher()
    if (payloadWatcher) payloadWatcher()
})

</script>