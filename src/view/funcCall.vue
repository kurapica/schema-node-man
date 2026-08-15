<template>
    <schema-view
      :key="funcNode.id"
      :node="funcNode"
      :in-form="SchemaNodeFormType.ExpandAll"
      :skin="skin"
      v-bind="$attrs">
    </schema-view>
    <schema-view
      :key="argsNode.id"
      :in-form="SchemaNodeFormType.ExpandAll"
      :node="argsNode"
      :skin="skin"
      v-bind="$attrs">
    </schema-view>
</template>

<script lang="ts" setup>
import { ArrayNode, getRecordedValues, StringNode, StructNode } from 'schema-node-core';
import schemaView from '../../../schema-node-vue-view/src/schemaView.vue';
import { toRaw } from 'vue';
import { getSubNodeFormType } from '../../../schema-node-vue-view/src/schemaView';
import { SchemaNodeFormType } from '../../../schema-node-vue-view/src/enum/formType';

const props = defineProps<{ node: StructNode, inForm?: SchemaNodeFormType, skin?: string }>();
const node = toRaw(props.node);
const funcNode = node.getAccessValue('func') as StringNode;
const argsNode = node.getAccessValue('args') as ArrayNode;
</script>