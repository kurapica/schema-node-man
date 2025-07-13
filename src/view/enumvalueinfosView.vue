<template>
    <table-view
        :node="node"
        :in-form="inForm"
        :plain-text="plainText"
        operWidth="200"
        v-bind="$attrs">
        <template #operator="{ row, index }">
            <template v-if="!readonly">
                <a href="javascript:void(0)" v-if="!isflags && index" @click="arrayNode.swapRow(index, index - 1)">{{ _L["schema.enumdefine.moveup"] }}</a>
                <a href="javascript:void(0)" v-if="customEnum || !(row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="arrayNode.delRows(index)">{{ _L["DEL"] }}</a>
            </template>
            <a href="javascript:void(0)" v-if="cascade.length > 1 && (row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="nextCascade(row)">{{ cascade[1] || _L["schema.enumdefine.downlevel"] }}</a>
        </template>
    </table-view>

    <!-- sub list -->
    <el-drawer v-if="subListStack.length" v-model="showSubList" :title="`${cascade[subListStack.length]} - ${subListStack[subListStack.length-1].name}(${subListStack[subListStack.length-1].value})`" direction="rtl" size="100%"
        destroy-on-close
        append-to-body
        :before-close="onSubValueEditorClose">
        <el-container class="main" style="height: 80vh;">
            <el-main>
                <table-view
                    v-if="subListNode"
                    :key="subListNode.guid"
                    :node="(subListNode as ArrayNode)"
                    :in-form="inForm"
                    :plain-text="plainText"
                    operWidth="200">
                    <template #operator="{ row, index }">
                        <template v-if="!readonly">
                            <a href="javascript:void(0)" v-if="index" @click="swapSubListRow(index, index - 1)">{{ _L["schema.enumdefine.moveup"] }}</a>
                            <a href="javascript:void(0)" v-if="customEnum || !(row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="delSubListRow(index)">{{ _L["DEL"] }}</a>
                        </template>
                        <a href="javascript:void(0)" v-if="(cascade.length > subListStack.length + 1) && (row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="nextCascade(row)">{{ cascade[subListStack.length + 1] || _L["schema.enumdefine.downlevel"] }}</a>
                    </template>
                </table-view>
            </el-main>
            <el-footer>
                <br/>
                <template v-if="!readonly">
                    <el-button type="primary" @click="saveSubList">{{ _L["schema.designer.save"] }}</el-button>
                    <el-button type="info" @click="closeSubList">{{ _L["schema.designer.cancel"] }}</el-button>
                </template>
                <el-button v-else type="info" @click="closeSubList">{{ _L["schema.designer.close"] }}</el-button>
            </el-footer>
        </el-container>
    </el-drawer>
</template>

<script setup lang="ts">
import { saveStorageSchema } from '@/schema';
import { getSchemaServerProvider } from '@/schemaServerProvider';
import { ElMessage } from 'element-plus';
import { ArrayNode, EnumValueType, getCachedSchema, getEnumSubList, jsonClone, saveEnumSubList, SchemaLoadState, type StructNode } from 'schema-node'
import { _L, tableView } from 'schema-node-vue-view'
import { onUnmounted, reactive, ref, toRaw } from 'vue'

const props = defineProps<{ node: ArrayNode, inForm?: any, plainText?: any }>()
const cascade = ref<string[]>([])
const arrayNode = toRaw(props.node)
const readonly = arrayNode.readonly
const isflags = ref(false)
let cascadeWatcher: Function | undefined = undefined
let valueFieldHandler: Function | undefined = undefined

const enumdefine = arrayNode.parent as StructNode
const namefield = (enumdefine.parent as StructNode).getField("name")
const valueTypefield = enumdefine.getField("type")

let customEnum = false
if (namefield.readonly)
{
    const schema = getCachedSchema(namefield.data)
    customEnum = !(schema?.loadState && (schema.loadState & (SchemaLoadState.Server | SchemaLoadState.System)))

    const cascadeField = enumdefine.getField("cascade")
    cascadeWatcher = cascadeField.subscribe(() => {
        cascade.value = cascadeField.data.slice(0)
    }, true)
}

if (valueTypefield.readonly)
{
    isflags.value = valueTypefield.rawData === EnumValueType.Flags
}
else
{
    valueFieldHandler = valueTypefield.subscribe(() => {
        isflags.value = valueTypefield.rawData === EnumValueType.Flags
    }, true)
}

// sub list
const showSubList = ref(false)
const subListStack: { value: any, name: string, data?: any[] }[] = reactive([])
const subListNode = ref<ArrayNode | null>(null)

const nextCascade = async (row: StructNode) => {
    const { value, name } = row.rawData
    if (subListStack.length)
        subListStack[subListStack.length - 1].data = subListNode.value?.data

    // new stack
    const newStack = { value, name }
    subListStack.push(newStack)

    // get sub list
    const sublist = await getEnumSubList(namefield.data, value) || []
    subListNode.value?.dispose()
    subListNode.value = new ArrayNode({
        type: arrayNode.config.type,
        readonly,
    }, [...sublist])
    showSubList.value = true
}

const swapSubListRow = (x: number, y: number) => toRaw(subListNode.value)?.swapRow(x, y)
const delSubListRow = (x: number) => toRaw(subListNode.value)?.delRows(x)

const saveSubList = async () => {
    const stack = subListStack[subListStack.length - 1]
    const schema = getCachedSchema(namefield.data)
    const serverProvider = getSchemaServerProvider()
    const data = jsonClone(subListNode.value?.data || [])
    if (serverProvider && schema?.loadState && (schema.loadState & SchemaLoadState.Server))
    {
        const res = await serverProvider.saveEnumSubList(namefield.data, stack.value, data)
        if (!res.result)
        {
            ElMessage.error(res.message)
            return
        }
    }
    saveEnumSubList(namefield.data, stack.value, data)
    saveStorageSchema(schema!)
    closeSubList()
}

// close sub list editor
const closeSubList = () => {
    subListStack.pop()

    if (subListStack.length)
    {
        subListNode.value?.dispose()
        subListNode.value = new ArrayNode({
            type: arrayNode.config.type,
            readonly
        }, [...subListStack[subListStack.length - 1].data!])
        showSubList.value = true
    }
    else
    {
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

// clear
onUnmounted(() => {
    if (cascadeWatcher) cascadeWatcher()
    if (valueFieldHandler) valueFieldHandler()
})

</script>