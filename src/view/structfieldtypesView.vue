<template>
    <div style="width: 100%;">
        <el-tabs v-if="elTabVis" ref="elTabsRef" class="struct-field-types" v-model="activeCol" :addable="!node.readonly" @edit="handleTabsEdit">
            <el-tab-pane v-for="(element, i) in elements"
                :closable="!(node.readonly || element.data.name && noClosable.includes(element.data.name))"
                :label="element.data.name ? `${element.data.display ? `${element.data.display}(${element.data.name})` : `${element.data.name}`}` : `${i + 1}`"
                :name="i"></el-tab-pane>
        </el-tabs>
        <schema-view v-if="activeCol >= 0 && activeCol < elements.length"
            :key="elements[activeCol].guid"
            :node="(elements[activeCol] as StructNode)"
            in-form="expand" 
            plain-text>
        </schema-view>
    </div>
</template>

<script lang="ts" setup>
import Sortable from 'sortablejs'
import { ElTabs } from "element-plus"
import { onMounted, onUnmounted, ref, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import schemaView, { _L } from 'schema-node-vue-view'
import { _LS, ArrayNode, getSchema, jsonClone, SchemaType, sformat, StructNode } from 'schema-node'

// tab panel
const elTabsRef = ref<InstanceType<typeof ElTabs>>()
const elTabVis = ref(true)

// properties
const props = defineProps<{ node: ArrayNode }>()
const arrayNode = toRaw(props.node)
const elements = ref<StructNode[]>([])

// display
const activeCol = ref(0)
const noClosable = ref<string[]>([])

// add/del
const handleTabsEdit = (target: any, action: string) => {
    if (action === "add") {
        arrayNode.addRow()
    }
    else if (action === "remove") {
        const delRow = arrayNode.elements[target]
        if (!delRow) return
        ElMessageBox.confirm(sformat(_LS("schema.structdefine.confirmflddel"), delRow.data.display || delRow.data.name || _L.value["schema.structdefine.anonymous"]), _L.value["schema.structdefine.fields"], {
            confirmButtonText: _L.value["YES"],
            cancelButtonText: _L.value["NO"]
        }).then(() => {
            arrayNode.delRows(target)
        })
    }
}

// sort
let sortble: Sortable | null = null
const regSortable = () => {
    sortble?.destroy()
    if (arrayNode.readonly) return

    const el: any = document.querySelector(".struct-field-types .el-tabs__nav")
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
onMounted(() => {
    let oldLength = 0
    dataChangeHandler = arrayNode.subscribe((action: any) => {
        const currlen = arrayNode.elements.length
        if (currlen !== oldLength || action === "swap")
        {
            oldLength = currlen
            elements.value = [ ...arrayNode.elements ] as StructNode[]
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
            ...fields.map(v => data.find((d: any) => d.name === v.name) || jsonClone(v)),
            ...data.filter((v: any) => !v.name || !noClosable.value.includes(v.name))
        ]
    }, true)

    regSortable()
})

onUnmounted(() => {
    if (dataChangeHandler) dataChangeHandler()
    if (baseChangeHandler) baseChangeHandler()
    sortble?.destroy()
})

</script>

<style lang="scss" scoped>
:deep {
    .el-form-item__content {
        margin-left: 0 !important;
    }
}

.require::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
}
</style>