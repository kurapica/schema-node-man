<template>
  <section style="width: 100%;min-width: 120px;display: flex;">
    <span v-if="state.readonly && text">
      <el-popover
        :ref="(el) => (node as any).popperRef = el"
        placement="left"
        :title="`${node.value}`"
        width="fit-content"
        trigger="hover" :boundaries-padding="10"
        @show="setHoverValue(node as any)"
      >
        <namespace-info v-if="state.hoverValue === node.value" :key="node.value as string" style="min-width: 300px;" :type="node.value as string" @update="updatePopover(node as any)"/>
        <template #reference>
            <span style="width: 100%; display: inline-block;">{{ state.display }}</span>
        </template>
      </el-popover>
    </span>
    <template v-else>
      <input-view
        :key="mainNode.id"
        :style="state.readonly && text ? {} : { width: (98 / (genericNodes.length + 1)) + '%' }"
        :node="mainNode"
        :readonly="readonly"
        :text="text"
        :debug="debug"
      >
        <template #default="{ node }">
          <el-popover
            :ref="(el) => node.popperRef = el"
            placement="left"
            :title="node.value"
            width="fit-content"
            trigger="hover" :boundaries-padding="10"
            @show="delaySetHoverValue(node)"
          >
            <namespace-info v-if="state.hoverValue === node.value" :key="node.value as string" style="min-width: 300px;" :type="node.value as string" @update="updatePopover(node as any)"/>
            <template #reference>
                <span style="width: 100%; display: inline-block;">{{ node.label }}</span>
            </template>
          </el-popover>
        </template>
      </input-view>
      <span v-if="genericNodes.length">&lt;</span>
      <template v-for="item in genericNodes" :key="item.id">
        <span :style="state.readonly && text ? {} : { width: (98 / (genericNodes.length + 1)) + '%' }">
          <schema-view
            :key="item.id"
            :node="item"
            :readonly="readonly"
            :text="text"
            :debug="debug"
          >
          <template v-for="[name, slot] in slotEntries" :key="name" #[name]="slotProps">
            <component :is="slot" v-bind="slotProps" />
          </template>
          </schema-view>
        </span>
      </template>
      <span v-if="genericNodes.length">&gt;</span>
    </template>
  </section>
</template>

<script lang="ts" setup>
import { buildFuncCall, debounce, Display, getNodeType, isNull, LocaleString, NODE_SELF, NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE, NS_SYSTEM_SCHEMA_REFLECT_TYPE, ReadOnly, splitGenericParams, StringNode, StringType, Valid } from 'schema-node-core'
import { isRef, nextTick, onMounted, onUnmounted, reactive, shallowRef, toRaw, useSlots } from 'vue'
import { schemaView, inputView, subscribeAncestorProperty, _L } from 'schema-node-vue-view';
import namespaceInfo from './namespaceInfo.vue';
import { ElPopover } from 'element-plus';

// ── Template ──────────────────────────────────────────────────────
const props = defineProps<{
  /** Scalar schema node */
  node: StringNode,
  
  /** The readonly mode */
  readonly?: boolean,
  
  /** Display readon only value as plain text */
  text?: boolean | 'left' | 'right' | 'center',

  debug?: boolean
}>()

// slots
const slots = useSlots()
const slotEntries = Object.entries(slots) as [string, (...args: any[]) => any][]

const node = toRaw(props.node)
const mainNode = shallowRef<StringNode>(node)
const genericNodes = shallowRef<StringNode[]>([])

// ── UI State ──────────────────────────────────────────────────────
/** Display state */
const state = reactive<{
  /** Data */
  data?: string,

  /** Default align */
  defaultAlign?: 'left' | 'right' | 'center',

  /** Require */
  require?: boolean,

  /** Readonly */
  readonly?: boolean

  display?: string

  /** The hover value of the node */
  hoverValue?: string
}>({ defaultAlign: 'left' })

// ── Life Cycle ────────────────────────────────────────────────────
/** Subscription */
const subs: Function[] = []

const writeBack = async () => {
  if (mainNode.value == node) return;

  // check main node value
  const type = mainNode.value.rawValue ? await getNodeType(mainNode.value.rawValue as string) : undefined;
  if (type && !type.isGeneric) {
    node.value = mainNode.value.rawValue;
    return;
  }

  if (genericNodes.value.every(i => !isNull(i.rawValue))) {
    node.value = `${mainNode.value.rawValue}<${genericNodes.value.map(i => i.rawValue).join(',')}>`;
  }
}

const getDisplay = async (name: string) => {
  const gstart = name.indexOf('<');
  let gpart = '';
  if (gstart >= 0)
  {
    gpart = name.substring(gstart + 1, name.length - 1);
    name = name.substring(0, gstart);
  }
  if (!name.length) return '';
  const type = await getNodeType(name);
  let display = type ? _L.value(type.getPropertyValue<LocaleString>(Display) ?? type.name) : name;
  if (gpart.length)
  {
    const parts: string[] = [];
    for (const g of splitGenericParams(gpart))
    {
      parts.push(await getDisplay(g));
    }
    display += `<${parts.join(',')}>`;
  }
  return display;
}

const setHoverValue = async (value: { popperRef: any, value: string }) => {
  state.hoverValue = value.value;
};
const updatePopover = (value: { popperRef: any }) => {
  value.popperRef?.popperRef?.popperInstanceRef?.update();
}
const delaySetHoverValue = debounce(setHoverValue, 500);

onMounted(() => {
  if (props.readonly)
    state.readonly = props.readonly;
  else
    subs.push(subscribeAncestorProperty(node, ReadOnly, async (values: boolean[]) => {
      state.readonly = values.some(v => v);
      if (state.readonly && props.text) state.display = await getDisplay(node.value as string ?? '');
    }, true));

  // split nodes
  subs.push(node.subscribe(async() => {
    let data = node.value as string ?? '';

    if (state.readonly && props.text)
      state.display = await getDisplay(data);

    // split generic part
    let genericPart = '';
    const gstart = data.indexOf('<');
    if (gstart >= 0)
    {
      genericPart = data.substring(gstart + 1, data.length - 1);
      data = data.substring(0, gstart);
    }

    const type = data ? await getNodeType(data) : undefined;
    const gtypes = genericPart.length ? Array.from(splitGenericParams(genericPart)) : [];

    // split generic part
    if (type?.isGeneric)
    {
      if (genericNodes.value.length == type.generics?.length) return; // already split
      const nsType = (await getNodeType(NS_SYSTEM_SCHEMA_NODE_VALUE_TYPE) as StringType)!;

      if (mainNode.value == node) {
        mainNode.value = node.type.create(data, node, node) as StringNode;
        mainNode.value.subscribe(writeBack)
      }
      genericNodes.value.forEach(i => i.dispose()) // dispose old nodes
      genericNodes.value = type.generics!.map((g, i) => {
        const genericNode = nsType.create(gtypes[i], node) as StringNode;
        if (g.compatibles?.length)
          genericNode.setPropertyValue(Valid, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.isassignableto`, NODE_SELF, false, ...g.compatibles), node)
        genericNode.subscribe(writeBack)
        return genericNode;
      });
    }
    // non-generic type
    else if (genericNodes.value.length)
    {
      if (mainNode.value != node) mainNode.value.dispose();
      mainNode.value = node;

      genericNodes.value.forEach(i => i.dispose()); // dispose old nodes
      genericNodes.value = [];
    }
  }, true))
})

onUnmounted(() => {
  if (mainNode.value != node) mainNode.value.dispose();
  genericNodes.value.forEach(i => i.dispose());
  subs.forEach(sub => sub());
})
</script>
