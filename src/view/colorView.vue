<template>
    <el-color-picker v-model="data" :disabled="state.disable || state.readonly"></el-color-picker>
</template>

<script lang="ts" setup>
import { ScalarNode } from 'schema-node'
import { computed, onMounted, onUnmounted, reactive, toRaw } from 'vue'

// Define props
const props = defineProps<{
    /**
     * Scalar schema node
     */
    node: ScalarNode,

    /**
     * Display readon only value as plain text
     */
    plainText?: any
}>()
const scalarNode = toRaw(props.node)

// display state
const state = reactive<{
    data?: any,
    disable?: boolean
    require?: boolean
    readonly?: boolean
}>({})

// Data
const data = computed({
    get(): any {
        return state.data
    },
    set(value: any) {
        scalarNode.data = value
    }
})

// data & state watcher
let dataWatcher: Function | null = null
let stateWatcher: Function | null = null

onMounted(() => {
    dataWatcher = scalarNode.subscribe(() => {
        const data = scalarNode.data
        state.data = data
    }, true)

    stateWatcher = scalarNode.subscribeState(() => {
        state.disable = scalarNode.rule.disable
        state.require = scalarNode.require
        state.readonly = scalarNode.readonly
    }, true)
})

onUnmounted(() => {
    if (dataWatcher) dataWatcher()
    if (stateWatcher) stateWatcher()
})

</script>