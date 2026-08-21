<template>
  <table-view :node="node" :in-form="inForm" :text="text" operWidth="200" v-bind="$attrs">
    <template #operator="{ row, index }">
      <template v-if="!readonly">
        <a href="javascript:void(0)" v-if="!isflags && index" @click="arrayNode.moveRow(index, index - 1)">{{
          _L["frontend.view.moveup"] }}</a>
        <a href="javascript:void(0)" v-if="customEnum || !((row as StructNode).getAccessValue('value')! as DataNode)!.readonly"
          style="padding-left: 1rem;" @click="arrayNode.delRows(index)">{{ _L["DEL"] }}</a>
      </template>
      <a href="javascript:void(0)" v-if="cascade.length > 1 && ((row as StructNode).getAccessValue('value')! as DataNode)!.readonly"
        style="padding-left: 1rem;" @click="nextCascade(row)">{{ _L(cascade[1] || "frontend.view.nextlevel")
        }}</a>
    </template>
  </table-view>

  <!-- sub list -->
  <el-drawer v-if="subListStack.length" v-model="showSubList"
    :title="`${_L(cascade[subListStack.length])} - ${_L(subListStack[subListStack.length - 1].display || subListStack[subListStack.length - 1].value)}(${subListStack[subListStack.length - 1].value})`"
    direction="rtl" size="100%" append-to-body :before-close="onSubValueEditorClose">
    <el-container class="main" style="height: 80vh;">
      <el-main>
        <table-view v-if="subListNode" :key="subListNode.id" :node="(subListNode as ArrayNode)" :in-form="inForm"
          :text="text" operWidth="200">
          <template #operator="{ row, index }">
            <template v-if="!readonly">
              <a href="javascript:void(0)" v-if="index" @click="swapSubListRow(index, index - 1)">{{
                _L["frontend.view.moveup"] }}</a>
              <a href="javascript:void(0)" v-if="customEnum || ((row as StructNode).getAccessValue('value')! as DataNode)!.readonly"
                style="padding-left: 1rem;" @click="delSubListRow(index)">{{ _L["DEL"] }}</a>
            </template>
            <a href="javascript:void(0)"
              v-if="(cascade.length > subListStack.length + 1) && ((row as StructNode).getAccessValue('value')! as DataNode)!.readonly"
              style="padding-left: 1rem;" @click="nextCascade(row)">{{ _L(cascade[subListStack.length + 1] ||
              "frontend.view.nextlevel") }}</a>
          </template>
        </table-view> 
      </el-main>
      <el-footer>
        <br />
        <template v-if="!readonly">
          <el-button type="primary" @click="saveSubList">{{ _L["frontend.view.save"] }}</el-button>
          <el-button type="info" @click="closeSubList">{{ _L["frontend.view.cancel"] }}</el-button>
        </template>
        <el-button v-else type="info" @click="closeSubList">{{ _L["frontend.view.close"] }}</el-button>
      </el-footer>
    </el-container>
  </el-drawer>
</template>

<script setup lang="ts">
import { saveStorageSchema } from '../schema';
import { ElMessage } from 'element-plus';
import { ArrayNode, combinePaths, DataNode, deepClone, Disable, EnumNode, EnumType, EnumValueType, getNodeType, LocaleString, ReadOnly, SchemaLoadState, StringNode, StructNode } from 'schema-node-core';
import { _L, tableView } from 'schema-node-vue-view'
import { onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import { subscribeAncestorProperty } from '../../../schema-node-vue-view/src/utility/toolset';
import { getSchemaServerProvider } from '../schema/provider/schemaServerProvider';

const props = defineProps<{ node: ArrayNode, inForm?: any, text?: any }>()
const arrayNode = toRaw(props.node)

const cascade = ref<LocaleString[]>([])
const readonly = ref(false)
const disabled = ref(false)
const isflags = ref(false)
const customEnum = ref(false)
const enumName = ref("")
const subs: Function[] = []

// sub list
const showSubList = ref(false)
const subListStack: { value: any, display?: LocaleString, data?: any[] }[] = reactive([])
const subListNode = ref<ArrayNode | null>(null)

const nextCascade = async (row: StructNode) => {
  const { value, display } = row.rawValue as { value: any, display: LocaleString | undefined };
  if (subListStack.length)
    subListStack[subListStack.length - 1].data = subListNode.value?.value as any[]

  // new stack
  const newStack = { value, display }
  subListStack.push(newStack)

  // get sub list
  const enumNode = (await getNodeType(enumName.value) as EnumType)!;
  const access = await enumNode.getEnumEntryAccess(value);
  const sublist = (access?.length ? access[access.length - 1].children : undefined) ?? [];
  subListNode.value?.dispose()
  subListNode.value = arrayNode.type.create([...sublist], arrayNode.parent) as ArrayNode;
  showSubList.value = true
}

const swapSubListRow = (x: number, y: number) => toRaw(subListNode.value)?.moveRow(x, y)
const delSubListRow = (x: number) => toRaw(subListNode.value)?.delRows(x)

const saveSubList = async () => {
  const stack = subListStack[subListStack.length - 1]
  const serverProvider = getSchemaServerProvider()
  const data = deepClone(subListNode.value?.value || [])
  if (serverProvider && customEnum.value) {
    const res = await serverProvider.saveEnumSubList(enumName.value, stack.value, data)
    if (!res) {
      ElMessage.error(_L.value["frontend.view.savefailed"])
      return
    }
    // force reload enum node
    return await getNodeType(enumName.value, undefined, undefined, true);
  }

  const enumType = await getNodeType(enumName.value) as EnumType;
  enumType.saveEnumSubList(stack.value, data)
  saveStorageSchema(enumType.getNodeSchema())
  closeSubList()
}

// close sub list editor
const closeSubList = () => {
  subListStack.pop()

  if (subListStack.length) {
    subListNode.value?.dispose()
    subListNode.value = arrayNode.type.create([...subListStack[subListStack.length - 1].data!], arrayNode.parent) as ArrayNode;
    showSubList.value = true
  }
  else {
    showSubList.value = false
    subListNode.value?.dispose()
    subListNode.value = null
  }
}

const onSubValueEditorClose = async (done: Function) => {
  await closeSubList()
  if (subListStack.length === 0)
    done()
}

onMounted(async () => {
  const enumdefine = arrayNode.parent as StructNode;
  const nsdefine = enumdefine.parent as StructNode;
  const nsfield = nsdefine.getAccessValue("namespace") as StringNode;
  const namefield = nsdefine.getAccessValue("name") as StringNode;
  const valueTypefield = enumdefine.getAccessValue("type") as EnumNode;

  if (namefield.readonly) {
    enumName.value = combinePaths(nsfield.getValue() as string, namefield.getValue() as string);
    const schema = (await getNodeType(enumName.value))?.getNodeSchema();
    customEnum.value = !((schema?.loadState ?? 0) & SchemaLoadState.System);

    const cascadeField = enumdefine.getAccessValue("cascade") as ArrayNode;
    subs.push(cascadeField.subscribe(() => cascade.value = (cascadeField.getValue() as LocaleString[]).slice(0), true));
  } 

  if (valueTypefield.readonly)
    isflags.value = valueTypefield.getValue() === EnumValueType.Flags
  else 
    subs.push(valueTypefield.subscribe(() => {
      isflags.value = valueTypefield.getValue() === EnumValueType.Flags
    }, true))

  subs.push(subscribeAncestorProperty(arrayNode, ReadOnly, (values: boolean[]) => readonly.value = values.some(v => v), true))
  subs.push(subscribeAncestorProperty(arrayNode, Disable, (values: boolean[]) => disabled.value = values.some(v => v), true))
})

// clear
onUnmounted(() => subs.forEach(sub => sub()))

</script>