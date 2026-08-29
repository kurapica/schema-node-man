<template>
  <el-table :data="tableNode" :header-cell-style="tableHeaderCellStyle">
    <el-table-column header v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label">
      <template #default="scope">
        <struct-field-view v-if="(scope.row as StructNode).isFieldChangable(column.prop)" :node="(scope.row as StructNode)" :field="column.prop" :readonly="readonly" :text="text" no-label :in-form="inForm" :skin="skin" :debug="debug" />
        <schema-view v-else :node="(scope.row as StructNode).getAccessValue(column.prop) as DataNode" :readonly="readonly" :text="text" :in-form="inForm" :skin="skin" :debug="debug" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import {  ArrayType, DataNode, Display, FuncCallArgsNode, InVisible, LocaleString, StructNode, StructType } from 'schema-node-core'
import { _L, SchemaNodeFormType, schemaView, structFieldView } from 'schema-node-vue-view';
import { nextTick, onMounted, onUnmounted, ref, toRaw } from 'vue'

defineOptions({ inheritAttrs: false })

const tableHeaderCellStyle = {
  backgroundColor: 'var(--app-surface-muted)',
  color: 'var(--app-text)',
  borderColor: 'var(--app-border)'
};

// ── Template ──────────────────────────────────────────────────────
const props = defineProps<{
  node: FuncCallArgsNode,
  readonly?: boolean,
  text?: boolean | 'left' | 'right' | 'center',
  inForm?: SchemaNodeFormType,
  skin?: string,
  debug?: boolean,
}>();
const node = (toRaw(props.node) as FuncCallArgsNode)!;

const tableNode = ref<StructNode[]>([]);
const columns = Array.from(((node.type as ArrayType).element! as StructType).getFields()
  .filter(f => !f.getPropertyValue(InVisible))
  .map(f => ({
    prop: f.name,
    display: f.getPropertyValue<LocaleString>(Display),
    label: _L.value(f.getPropertyValue<LocaleString>(Display)) || f.name
  })))

// ── Life Cycle ────────────────────────────────────────────────────
/** Subscription */
const subs: Function[] = []

onMounted(() => {
  subs.push(node.subscribeArgs(async() => {
    tableNode.value = [];
    await nextTick();
    tableNode.value = [...node];
  }, true))
})

onUnmounted(() => {
  subs.forEach(sub => sub())
})
</script>
