<template>
    <span v-if="state.readonly && plainText" :style="{'width': '100%', 'text-align': plainText === true ? 'center' : plainText }">
        {{ props.node.data }}
    </span>
    <section v-else style="display: flex; width:100%;">
        <schema-view
            v-model="prefix"
            :config="{
                type:'schema.namespace',
                display: _L['schema.designer.upnamespace']
            }"
        ></schema-view>
        <el-input
            v-model.trim="name"
            :disabled="state.readonly"
            :placeholder="getInputPlaceHolder(scalarNode)"
        ></el-input>
    </section>
</template>

<script setup lang="ts">
import { type ScalarNode } from 'schema-node'
import schemaView, { _L, getInputPlaceHolder } from 'schema-node-vue-view';
import { ref, onMounted, onUnmounted, reactive, toRaw, watch } from 'vue'

const props = defineProps<{ node: ScalarNode, plainText?: any, disabled?: boolean }>()
const scalarNode = toRaw(props.node)

// display state
const state = reactive<{
    data?: any,
    disable?: boolean,
    require?: boolean,
    readonly?: boolean,
}>({})

// Data
const prefix = ref(localStorage["schema_new_namespace"] || "")
const name = ref("")

const refreshData = () => {
    if (props.node.readonly) return
    props.node.data = name.value ? (prefix.value ? `${prefix.value}.${name.value}` : name.value) : ""
}

watch(prefix, refreshData)
watch(name, refreshData)

// change handler
let dataWatcher: Function | null = null
let stateHandler: Function | null = null

onMounted(() => {
    dataWatcher = scalarNode.subscribe(async() =>  {
        const data = scalarNode.rawData
        state.data = data
        prefix.value = data ? data.substring(0, data.lastIndexOf(".")) : prefix.value
        name.value = data ? data.substring(data.lastIndexOf(".") + 1) : ""
    }, true)

    stateHandler = scalarNode.subscribeState(() => {
        state.disable = scalarNode.rule.disable
        state.require = scalarNode.require
        state.readonly = scalarNode.readonly
    }, true)
})

onUnmounted(() => {
    if (dataWatcher) dataWatcher()
    if (stateHandler) stateHandler()
})

</script>