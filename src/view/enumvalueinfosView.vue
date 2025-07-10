<template>
    <table-view
        :node="node"
        v-bind="$attrs">
        <template #operator="{ row, index }">
            <a href="javascript:void(0)" v-if="!readonly && index" @click="arrayNode.swapRow(index, index - 1)">{{ _L["schema.enumdefine.moveup"] }}</a>
            <a href="javascript:void(0)" v-if="cascade.length > 1 && (row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="nextCascade(row)">{{ cascade[1] || _L["schema.enumdefine.downlevel"] }}</a>
            <a href="javascript:void(0)" v-if="!(row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="arrayNode.delRows(index)">{{ _L["DEL"] }}</a>
        </template>

        <!-- try it -->
        <el-drawer v-model="showSubList" :title="_" direction="rtl" size="100%"
            destroy-on-close
            append-to-body
            :before-close="onSubValueEditorClose">
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <table-view
                        v-if="subListNode"
                        :key="subListNode.guid"
                        :node="(subListNode as ArrayNode)">
                        <template #operator="{ row, index }">
                            <a href="javascript:void(0)" v-if="!readonly && index" @click="arrayNode.swapRow(index, index - 1)">{{ _L["schema.enumdefine.moveup"] }}</a>
                            <a href="javascript:void(0)" v-if="cascade.length > 1 && (row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="nextCascade(row)">{{ cascade[1] || _L["schema.enumdefine.downlevel"] }}</a>
                            <a href="javascript:void(0)" v-if="!(row as StructNode).getField('value').readonly" style="padding-left: 1rem;" @click="arrayNode.delRows(index)">{{ _L["DEL"] }}</a>
                        </template>
                    </table-view>
                </el-main>
                <el-footer>
                    <br/>
                </el-footer>
            </el-container>
        </el-drawer>
    </table-view>
</template>

<script setup lang="ts">
import { getSchemaServerProvider } from '@/schemaServerProvider';
import { ElMessage } from 'element-plus';
import { ArrayNode, getCachedSchema, getEnumSubList, saveEnumSubList, SchemaLoadState, type StructNode } from 'schema-node'
import { _L, tableView } from 'schema-node-vue-view'
import { onUnmounted, reactive, ref, toRaw } from 'vue'

const props = defineProps<{ node: ArrayNode }>()
const cascade = ref<string[]>([])
const arrayNode = toRaw(props.node)
const readonly = arrayNode.readonly
let cascadeWatcher: Function | undefined = undefined

const enumdefine = arrayNode.parent as StructNode
const namefield = (enumdefine.parent as StructNode).getField("name")
if (namefield.readonly)
{
    const cascadeField = enumdefine.getField("cascade")
    cascadeWatcher = cascadeField.subscribe(() => {
        cascade.value = cascadeField.data.slice(0)
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
        readonly: arrayNode.readonly,
    }, [...sublist])
    showSubList.value = true
}

const saveSubList = async () => {
    const stack = subListStack[subListStack.length - 1]
    const schema = getCachedSchema(namefield.data)
    const serverProvider = getSchemaServerProvider()
    const data = subListNode.value?.data || []
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
    closeSubList()
}

// close sub list editor
const closeSubList = () => {
    subListStack.pop()

    if (subListStack.length)
    {
        subListNode.value?.dispose()
        subListNode.value = new ArrayNode({
            type: arrayNode.config.type
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
})

</script>