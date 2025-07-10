<template>
    <table-view
        :node="node"
        v-bind="$attrs">
        <template #operator="{ row }">
            <a href="javascript:void(0)" v-if="cascade.length && (row as StructNode).getField('value').readonly" style="display: inline;">{{ cascade[0] || _L["schema.enumdefine.downlevel"] }}</a>
        </template>
    </table-view>
</template>

<script setup lang="ts">
import type { ArrayNode, StructNode } from 'schema-node'
import { _L, tableView } from 'schema-node-vue-view'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ node: ArrayNode }>()
const cascade = ref<string[]>([])

let cascadeWatcher: Function | undefined = undefined

onMounted(async () => {
    const enumdefine = props.node.parent as StructNode
    if ((enumdefine.parent as StructNode).getField("name").readonly)
    {
        // only enable cascade enum value define when
        const cascadeField = enumdefine.getField("cascade")
        cascadeWatcher = cascadeField.subscribe(() => {
            cascade.value = cascadeField.data.slice(1)
        }, true)
    }
})

onUnmounted(() => {
    if (cascadeWatcher) cascadeWatcher()
})

</script>