<template>
    <table-view
        :node="node"
        v-bind="$attrs">
        <template #operator>
            <a href="javascript:void(0)" style="display: inline;">{{ _L["schema.enumdefine.downlevel"] }}</a>
        </template>
    </table-view>
</template>

<script setup lang="ts">
import type { ArrayNode, StructNode } from 'schema-node'
import { _L, tableView } from 'schema-node-vue-view'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ node: ArrayNode, value?: any }>()
const cascade = ref<string[]>([])

let cascadeWatcher: Function | undefined = undefined

onMounted(async () => {
    const enumdefine = props.node.parent as StructNode
    const cascadeField = enumdefine.getField("cascade")
    cascadeWatcher = cascadeField.subscribe(() => {
        cascade.value = [...cascadeField.data]
    })

    // check value
})

onUnmounted(() => {
    if (cascadeWatcher) cascadeWatcher()
})

</script>