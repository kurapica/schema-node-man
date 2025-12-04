<template>
    <div style="width: 100%;">
        <el-tabs class="struct-field-types" v-model="activeCol" :addable="!node.readonly" @edit="handleTabsEdit">
            <el-tab-pane v-for="(element, i) in elementDisplay"
                :closable="!node.readonly"
                :label="`${element.field} - ${element.type}`"
                :name="i"></el-tab-pane>
        </el-tabs>
        <schema-view v-if="activeCol >= 0 && activeCol < elements.length"
            :key="elements[activeCol].guid"
            :node="(elements[activeCol] as StructNode)"
            in-form="expand" 
            plain-text="left">
        </schema-view>
    </div>
</template>

<script lang="ts" setup>
import { ElTabs } from "element-plus"
import { onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import { schemaView, _L } from 'schema-node-vueview'
import { _LS, ArrayNode, getAppSchema, StructNode, type AnySchemaNode, type IAppFieldSchema } from 'schema-node'

// properties
const props = defineProps<{ node: ArrayNode }>()
const arrayNode: ArrayNode = toRaw(props.node)

// display
const activeCol = ref(0)
const elements = ref<StructNode[]>([])

// add/del
const handleTabsEdit = (target: any, action: string) => {
    if (action === "add") {
        arrayNode.addRow()
    }
    else if (action === "remove") {
        const delRow = arrayNode.elements[target]
        if (!delRow) return
        ElMessageBox.confirm(_L.value["system.schema.structschema.confirmrldel"], _L.value["system.schema.structschema.relations"], {
            confirmButtonText: _L.value["YES"],
            cancelButtonText: _L.value["NO"]
        }).then(() => {
            arrayNode.delRows(target)
        })
    }
}

// data change handler
let dataChangeHandler: Function | null = null
let elementDisplay = reactive<{ guid: string, field: string, handler: Function, type: string }[]>([])
let fields: IAppFieldSchema[] = []
onMounted(async () => {
    let oldLength = 0

    const app = (arrayNode.parent as StructNode).getField("app")?.data
    fields = app ? (await getAppSchema(app))?.fields ?? [] : []

    dataChangeHandler = arrayNode.subscribe((action: any) => {
        const currlen = arrayNode.elements.length
        if (currlen !== oldLength || action === "swap")
        {
            oldLength = currlen
            elements.value = [ ...arrayNode.elements ] as StructNode[]
            
            for(let i = 0; i < arrayNode.elements.length; i++)
            {
                const ele: AnySchemaNode = arrayNode.elements[i]
                if (elementDisplay.length > i)
                {
                    if (ele.guid === elementDisplay[i].guid) continue
                    elementDisplay[i].handler()
                }
                const view = reactive<{
                    guid: string,
                    type: string,
                    field: string,
                    handler: Function
                }>({
                    guid: ele.guid,
                    type: "",
                    field: "",
                    handler: ():void => {}
                })
                view.handler = ele.subscribe(() => {
                    const { field, type } = ele.rawData
                    view.field = field
                    view.type = type ? _L.value["system.schema.relationtype."+(type as string).toLowerCase()] : ""
                }, true)
                elementDisplay[i] = view
            }
            
            for(let i = elementDisplay.length - 1; i >= arrayNode.elements.length; i--)
            {
                elementDisplay.pop()?.handler()
            }
        }
    }, true)
})

onUnmounted(() => {
    if (dataChangeHandler) dataChangeHandler()
    elementDisplay.forEach(v => v.handler())
})

</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
    margin-left: 0 !important;
}

.require::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
}
</style>