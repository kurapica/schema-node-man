<template>
  <el-container style="width: 100%;">
    <el-aside>
      <el-tree :data="options" :default-props="{ children: 'children', label: 'label' }" @node-click="handleNodeClick"
        accordion>
        <template #default="{ data }">
          <span>{{ data.label }}</span>
          <span v-if="countMap[data.value]" style="position: absolute; right: 10px;color:blue">({{ countMap[data.value]
            }})</span>
        </template>
      </el-tree>
    </el-aside>
    <el-main>
      <template v-if="activeField">
        <el-tabs class="struct-field-types" v-model="activeCol" :addable="!node.readonly" @edit="handleTabsEdit">
          <el-tab-pane v-for="(element, i) in elementDisplay" :closable="!node.readonly" :label="`${element.type}`"
            :name="i"></el-tab-pane>
        </el-tabs>
        <schema-view v-if="activeCol >= 0 && activeCol < elements.length" :key="elements[activeCol].guid"
          :node="(elements[activeCol] as StructNode)" in-form="expand" text="left">
        </schema-view>
      </template>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>

import { ElTabs } from "element-plus"
import { onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import { ElMessageBox } from 'element-plus'
import { schemaView, _L } from 'schema-node-vue-view'
import { _LS, ARRAY_ELEMENT, ArrayNode, getCachedSchema, getSchema, isNull, RelationType, SchemaType, StructNode } from 'schema-node'

//#region Inner type
interface ITreeInfo {
  value: string
  label: string
  children: ITreeInfo[] | null
}

const options = ref<ITreeInfo[]>([])

const buildOptions = async (fields: { name: string, type: string, display?: any }[], prefix: string = ""): Promise<ITreeInfo[]> => {
  const result: ITreeInfo[] = []
  for (let i = 0; i < fields.length; i++) {
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
    if (isArray && (schema?.type === SchemaType.Enum || schema?.type === SchemaType.Scalar)) {
      option.children ||= []
      option.children.unshift({
        value: `${prefix}${f.name}.${ARRAY_ELEMENT}`,
        label: _L.value["frontend.design.reltarfield.ele"],
        children: null
      })
    }
    result.push(option)
  }
  return result
}

const getFirstField = (items: ITreeInfo[]): string => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.children && item.children.length) {
      const child = getFirstField(item.children)
      if (child) return child
    }
    return item.value
  }
  return ""
}

const getStructOptions = async (): Promise<ITreeInfo[]> => {
  let parentNode = arrayNode.parent
  while (parentNode && parentNode.config.type !== "system.schema.def.struct.schema" && parentNode.config.type !== "system.schema.def.array.schema")
    parentNode = parentNode.parent

  if (!parentNode) return []

  if (parentNode.config.type === "system.schema.def.struct.schema") {
    const fieldsNode = (parentNode as StructNode).getField("fields") as ArrayNode
    return await buildOptions(fieldsNode?.data || [])
  }

  const elementType = (parentNode as StructNode).getField("element")?.data
  const schema = elementType ? await getSchema(elementType) : null
  if (schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum) {
    return [{
      value: ARRAY_ELEMENT,
      label: _L.value["frontend.design.reltarfield.ele"],
      children: null
    }]
  }

  return await buildOptions(schema?.type === SchemaType.Struct ? schema.struct!.fields : [])
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
const countMap = ref<{ [key: string]: number }>({})

// add/del
const handleTabsEdit = (target: any, action: string) => {
  if (action === "add") {
    arrayNode.addRow(undefined, { field: activeField.value, type: RelationType.Default })
  }
  else if (action === "remove") {
    const delRow = elements.value[target]
    if (!delRow) return
    ElMessageBox.confirm(_L.value["system.schema.def.struct.schema.confirmrldel"], _L.value["system.schema.def.struct.schema.relations"], {
      confirmButtonText: _L.value["YES"],
      cancelButtonText: _L.value["NO"]
    }).then(() => {
      const index = arrayNode.elements.findIndex(v => v.guid === delRow.guid)
      if (index < 0) return
      arrayNode.delRows(index)
    })
  }
}

const refresh = () => {
  const eles: StructNode[] = []
  const map: { [key: string]: number } = {}

  let index = 0;
  for (let i = 0; i < arrayNode.elements.length; i++) {
    const ele = arrayNode.elements[i] as StructNode
    const name = ele.getField("field")?.data
    if (!name) continue

    // count
    map[name] = (map[name] || 0) + 1
    if (name.includes(".")) {
      const paths = name.split(".").filter((v: string) => !isNull(v))
      for (let j = 0; j < paths.length - 1; j++) {
        const fld = paths.slice(0, j + 1).join(".")
        map[fld] = (map[fld] || 0) + 1
      }
    }

    // active field only
    if (name !== activeField.value) continue
    eles.push(ele)

    if (elementDisplay.length > index) {
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
      handler: (): void => { }
    })
    view.handler = ele.subscribe(() => {
      const { field, type } = ele.rawData
      view.field = field
      view.type = type ? _L.value["system.schema.def.struct.relationtype." + (type as string).toLowerCase()] : ""
    }, true)
    elementDisplay[index++] = view
  }

  for (let i = elementDisplay.length - 1; i >= eles.length; i--)
    elementDisplay.pop()?.handler()
  elements.value = eles

  countMap.value = map
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
  options.value = await getStructOptions()

  dataChangeHandler = arrayNode.subscribeLayoutChanged(refresh, true)

  if (!activeField.value) {
    activeField.value = getFirstField(options.value)
    if (activeField.value) refresh()
  }
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