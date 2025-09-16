<template>
    <schema-view
        :key="localeNode.guid"
        :node="localeNode.getField('key')"
        v-bind="$attrs"
    ></schema-view>
</template>

<script lang="ts" setup>
import { StructNode } from 'schema-node'
import { schemaView } from 'schema-node-vueview'
import { toRaw } from 'vue';

const props = defineProps<{
    /**
     * Struct Schema node
     */
    node: StructNode,
}>()

const localeNode = toRaw(props.node)

</script>