<template>
  <table-view :node="node" :view-columns="['target', 'property', 'kind']" sortable v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { tableView, _L } from 'schema-node-vue-view'
import { ArrayNode } from 'schema-node-core';

// properties
const props = defineProps<{ node: ArrayNode }>()

</script>