<template>
    <div style="width: 100%;">
        <el-tabs v-if="elTabVis" ref="elTabsRef" class="struct-field-types" v-model="activeCol" :addable="!node.readonly" @edit="handleTabsEdit">
            <el-tab-pane v-for="(element, i) in elementDisplay"
                :closable="!(node.readonly || element.require || element.name && noClosable.includes(element.name))"
                :label="_L(element.display || element.name || _L['schema.structdefine.unkown'])"
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
import Sortable from 'sortablejs'
import { ElTabs } from "element-plus"
import { onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import { schemaView, _L } from 'schema-node-vueview'
import { _LS, ArrayNode, getSchema, jsonClone, SchemaType, sformat, StructNode } from 'schema-node'
import type { AnySchemaNode } from 'schema-node'

// tab panel
const elTabsRef = ref<InstanceType<typeof ElTabs>>()
const elTabVis = ref(true)

// properties
const props = defineProps<{ node: ArrayNode }>()
const arrayNode: ArrayNode = toRaw(props.node)

// display
const activeCol = ref(0)
const elements = ref<StructNode[]>([])
const noClosable = ref<string[]>([])

// add/del
const handleTabsEdit = (target: any, action: string) => {
    if (action === "add") {
        arrayNode.addRow()
    }
    else if (action === "remove") {
        const delRow = arrayNode.elements[target]
        if (!delRow) return
        ElMessageBox.confirm(sformat("schema.structdefine.confirmflddel", delRow.data.display || delRow.data.name || "schema.structdefine.anonymous"), _L.value["schema.structdefine.fields"], {
            confirmButtonText: _L.value["YES"],
            cancelButtonText: _L.value["NO"]
        }).then(() => {
            arrayNode.delRows(target)
        })
    }
}

// sort
let sortble: Sortable | null = null
let sortbleTime = 0
const regSortable = () => {
    sortble?.destroy()
    if (arrayNode.readonly) return

    const el: any = document.querySelector(".struct-field-types .el-tabs__nav")
    if (!el) 
    {
        sortbleTime = setTimeout(regSortable, 1000)
        return
    }
    sortble = Sortable.create(el, {
        draggable: ".el-tabs__item",
        onEnd(params: any) {
            let { oldIndex, newIndex } = params
            if (oldIndex === newIndex) return

            oldIndex = oldIndex! - 1
            newIndex = newIndex! - 1

            arrayNode.swapRow(oldIndex, newIndex)

            elTabVis.value = false
            setTimeout(() => {
                elTabVis.value = true
                setTimeout(regSortable, 5)
            }, 5)
        }
    })
}

// data change handler
let dataChangeHandler: Function | null = null
let baseChangeHandler: Function | null = null
let elementDisplay = reactive<{ guid: string, name: string, handler: Function, display: string, require: boolean }[]>([])
onMounted(() => {
    let oldLength = 0
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
                    display: string,
                    name: string,
                    require: boolean
                    handler: Function
                }>({
                    guid: ele.guid,
                    display: "",
                    name: "",
                    require: false,
                    handler: ():void => {}
                })
                view.handler = ele.subscribe(() => {
                    const { name, display, require } = ele.rawData
                    view.name = name
                    view.display = _L.value(display)
                    view.require = require
                }, true)
                elementDisplay[i] = view
            }
            
            for(let i = elementDisplay.length - 1; i >= arrayNode.elements.length; i--)
            {
                elementDisplay.pop()?.handler()
            }
        }
    }, true)

    if (arrayNode.readonly) return

    const base = (arrayNode.parent as StructNode).getField("base")
    let orgbase = ""
    baseChangeHandler = base.subscribe(async () => {
        const currbase = toRaw(base.data)
        if (orgbase === currbase) return
        orgbase = currbase
        noClosable.value = []
        if (!orgbase) return

        const baseSchema = await getSchema(orgbase)
        if (baseSchema?.type !== SchemaType.Struct) return
        const data = jsonClone(arrayNode.data)
        const fields = baseSchema.struct?.fields || []
        noClosable.value = fields.map(f => f.name)

        // all exist
        if (data.length >= noClosable.value.length && noClosable.value.findIndex(n => data.findIndex((d: any) => d.name === n) < 0) < 0) return

        // rebuild
        arrayNode.data = [
            ...fields.map((v: any) => data.find((d: any) => d.name === v.name) || jsonClone(v)),
            ...data.filter((v: any) => !v.name || !noClosable.value.includes(v.name))
        ]
    }, true)

    regSortable()
})

onUnmounted(() => {
    if (dataChangeHandler) dataChangeHandler()
    if (baseChangeHandler) baseChangeHandler()
    elementDisplay.forEach(v => v.handler())
    sortble?.destroy()
    if (sortbleTime) clearTimeout(sortbleTime)
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