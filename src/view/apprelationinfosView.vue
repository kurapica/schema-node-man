<template>
    <el-container style="width: 100%;">
        <el-aside>
            <el-tree :data="options" :default-props="{ children: 'children', label: 'label' }" @node-click="handleNodeClick" accordion></el-tree>
        </el-aside>
        <el-main>
            <template v-if="activeField">
                <el-tabs class="struct-field-types" v-model="activeCol" :addable="!node.readonly" @edit="handleTabsEdit">
                    <el-tab-pane v-for="(element, i) in elementDisplay"
                        :closable="!node.readonly"
                        :label="`${element.type}`"
                        :name="i"></el-tab-pane>
                </el-tabs>
                <schema-view v-if="activeCol >= 0 && activeCol < elements.length"
                    :key="elements[activeCol].guid"
                    :node="(elements[activeCol] as StructNode)"
                    in-form="expand" 
                    plain-text="left">
                </schema-view>
            </template>
        </el-main>
    </el-container>
</template>

<script lang="ts" setup>
import { ElTabs } from "element-plus"
import { onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import { schemaView, _L } from 'schema-node-vueview'
import { _LS, ARRAY_ELEMENT, ArrayNode, getAppSchema, getCachedSchema, getSchema, isNull, RelationType, SchemaType, StructNode, type AnySchemaNode } from 'schema-node'

//#region Inner type
interface ITreeInfo {
    value: string
    label: string
    children: ITreeInfo[] | null
}

const options = ref<ITreeInfo[]>([])

const buildOptions = async (fields: { name: string, type: string, display?: any }[], prefix: string = ""): Promise<ITreeInfo[]> => {
    const result: ITreeInfo[] = []
    for(let i = 0; i < fields.length; i++)
    {
        const f = fields[i]
        if (isNull(f.name) || isNull(f.type)) continue
        let schema = await getSchema(f.type)
        const isArray = schema?.type === SchemaType.Array
        if (isArray)
            schema = getCachedSchema(schema!.array!.element)
        const option = {
            value: `${prefix}${f.name}`,
            label: `${_L.value(f.display) || f.name}`,
            children: schema?.type === SchemaType.Struct ? await buildOptions(schema.struct!.fields, `${prefix}${f.name}.`) : null
        }
        if (isArray && (schema?.type === SchemaType.Enum || schema?.type === SchemaType.Scalar))
        {
            option.children ||= []
            option.children.unshift ({
                value: `${prefix}${f.name}.${ARRAY_ELEMENT}`,
                label: _L.value["system.schema.reltarfield.ele"],
                children: null
            })
        }
        result.push(option)
    }
    return result
}
//#endregion

// properties
const props = defineProps<{ node: ArrayNode }>()
const arrayNode: ArrayNode = toRaw(props.node)

// display
const activeField = ref("")
const activeCol = ref(0)
const elements = ref<StructNode[]>([])
const elementDisplay = reactive<{ guid: string, field: string, handler: Function, type: string }[]>([])

// add/del
const handleTabsEdit = (target: any, action: string) => {
    if (action === "add") {
        arrayNode.addRow(undefined, { field: activeField.value, type: RelationType.Default })
    }
    else if (action === "remove") {
        const delRow = elements.value[target]
        if (!delRow) return
        ElMessageBox.confirm(_L.value["system.schema.structschema.confirmrldel"], _L.value["system.schema.structschema.relations"], {
            confirmButtonText: _L.value["YES"],
            cancelButtonText: _L.value["NO"]
        }).then(() => {
            const index = elements.value.findIndex(v => v.guid === delRow.guid)
            if (index < 0) return
            arrayNode.delRows(index)
        })
    }
}

const refresh = () => {
    const eles: StructNode[] = []
    
    let index = 0;
    for(let i = 0; i < arrayNode.elements.length; i++) {
        const ele = arrayNode.elements[i] as StructNode
        if (ele.getField("field")?.data !== activeField.value) continue
        eles.push(ele)

        if (elementDisplay.length > index)
        {
            if (ele.guid === elementDisplay[index].guid) {
                index++
                continue
            }
            elementDisplay[index].handler()
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
        elementDisplay[index++] = view
    }
    
    for(let i = elementDisplay.length - 1; i >= eles.length; i--)
        elementDisplay.pop()?.handler()
    elements.value = eles
}

// node click
const handleNodeClick = (data: any) => {
    activeField.value = data.value
    activeCol.value = 0
    refresh()
}

// data change handler
let dataChangeHandler: Function | null = null
onMounted(async () => {
    let oldLength = 0

    const app = (arrayNode.parent as StructNode).getField("name")?.data
    options.value = await buildOptions(app ? (await getAppSchema(app))?.fields ?? [] : [])

    dataChangeHandler = arrayNode.subscribe((action: any) => {
        const currlen = arrayNode.elements.length
        if (currlen !== oldLength || action === "swap")
        {
            oldLength = currlen
            refresh()
        }
    })
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