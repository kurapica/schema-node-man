<template>
  <section style="width:98%;">
    <section style="width:100%; padding: 1rem; margin-bottom: 1rem;" v-for="i in state.length">
        <schema-view v-if="node.at(i - 1)"
          :node="node.at(i - 1)!"
          :text="text"
          :in-form="getSubNodeFormType(node.at(i - 1)!, inForm, skin)"
          no-label
          :readonly="readonly"
          v-bind="$attrs"
        >
        <template v-for="[name, slot] in slotEntries" :key="name" #[name]="slotProps">
          <component :is="slot" v-bind="slotProps" />
        </template>
      </schema-view>
      <el-button type="danger" v-if="!state.readonly && state.delAble" @click="node.delRows(i - 1)" style="float:right;margin-left: 1rem;">{{ _L["DEL"] }}</el-button>  
      <hr v-if="i < state.length"/>
    </section>
    <el-button type="success" v-if="!state.readonly && state.addAble" @click="node.addRow()">{{ _L["ADD"] }}</el-button>
  </section>
</template>

<script lang="ts" setup>
import { ArrayNode, ArrayType, Disable, isNull, MaxSize, MinSize, ReadOnly, Require, StructType } from 'schema-node-core'
import { onMounted, onUnmounted, reactive, toRaw, useSlots } from 'vue'
import { _L, schemaView, getSubNodeFormType, SchemaNodeFormType, subscribeAncestorProperty } from 'schema-node-vue-view'

defineOptions({
  inheritAttrs: false
})

// ── Template ──────────────────────────────────────────────────────
const props = defineProps<{
  node: ArrayNode,
  readonly?: boolean,
  text?: boolean | 'left' | 'right' | 'center',
  inForm?: SchemaNodeFormType,
  skin?: string
}>();
const node = (toRaw(props.node) as ArrayNode)!;

// slots
const slots = useSlots();
const slotEntries = Object.entries(slots) as [string, (...args: any[]) => any][];

// ── UI State ──────────────────────────────────────────────────────
const state = reactive<{
  readonly?: boolean
  disable?: boolean
  length: number,
  simple?: boolean,
  addAble?: boolean,
  delAble?: boolean
}>({ length: 0 })

// ── Life Cycle ────────────────────────────────────────────────────
/** Subscription */
const subs: Function[] = []

onMounted(() => {
  state.simple = !((node.type as ArrayType).element instanceof StructType)

  if (props.readonly) {
    state.readonly = true
  } else {
    subs.push(subscribeAncestorProperty(node, ReadOnly, (values: boolean[]) => state.readonly = values.some(v => v), true))
    subs.push(subscribeAncestorProperty(node, Disable, (values: boolean[]) => state.disable = values.some(v => v), true))
  }

  subs.push(node.subscribe(() => {
    if (!state.readonly && state.simple) {
      const length = node.length
      const last = node.at(length - 1)
      if ((length === 0 || !isNull(last?.rawValue)) && node.addAble) {
        if (node.length > 0) node.at(node.length - 1)?.setPropertyValue(Require, undefined, node); // clear
        node.addRow()?.setPropertyValue(Require, false, node); // make not required
      }
      else if (length >= 2 && isNull(node.at(length - 2)?.rawValue) && node.delAble) {
        node.delRows(length - 1);
        if (node.length > 0) node.at(node.length - 1)?.setPropertyValue(Require, false, node);
      }
    }

    state.length = node.length
    state.addAble = node.addAble
    state.delAble = node.delAble
  }, true))

  subs.push(node.subscribeProperty(MaxSize, () => state.addAble = node.addAble))
  subs.push(node.subscribeProperty(MinSize, () => state.delAble = node.delAble))
})

onUnmounted(() => {
  subs.forEach(sub => sub())
})
</script>