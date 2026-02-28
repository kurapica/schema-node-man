<template>
  <div style="width: 100%;">
    <el-table class="struct-field-table" :data="elementDisplay" style="width: 100%;" :border="true"
      :max-height="tableMaxHeight" header-align="left" :header-cell-style="{ background: '#eee' }"
      :row-class-name="fieldRowClassName" @row-click="handleRowClick">
      <el-table-column align="left" prop="name" :label="_L['frontend.view.name']" min-width="140">
        <template #default="scope">
          <span>{{ scope.row.name || _L['system.schema.structschema.unkown'] }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="type" :label="_L['frontend.view.type']" min-width="150">
        <template #default="scope">
          <schema-view v-model="scope.row.type" :config="{ type: 'system.schema.valuetype', readonly: true }"
            plain-text="left"></schema-view>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="display" :label="_L['frontend.view.display']" min-width="180">
        <template #default="scope">
          <span>{{ scope.row.display || scope.row.name || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="desc" :label="_L['frontend.view.desc']" min-width="180">
        <template #default="scope">
          <span>{{ scope.row.desc || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" header-align="center" :label="_L['frontend.view.oper']" width="300">
        <template #header>
          <a href="javascript:void(0)" v-if="!node.readonly" @click="handleAddField"
            style="text-decoration: underline; color: lightseagreen;">
            {{ _L['frontend.view.new'] }}
          </a>
          <span v-else>{{ _L['frontend.view.oper'] }}</span>
        </template>
        <template #default="scope">
          <el-button type="success" @click.stop="handleEditField(scope.$index)">{{ _L['frontend.view.edit']
          }}</el-button>
          <el-button v-if="!node.readonly && scope.$index > 0" type="warning" @click.stop="moveFieldUp(scope.$index)">{{
            _L['frontend.view.moveup'] }}</el-button>
          <el-popconfirm
            v-if="!node.readonly && !scope.row.require && !(scope.row.name && noClosable.includes(scope.row.name))"
            :title="sformat('system.schema.structschema.confirmflddel', scope.row.display || scope.row.name || 'system.schema.structschema.anonymous')"
            :confirm-button-text="_L['YES']" :cancel-button-text="_L['NO']" @confirm="handleDeleteField(scope.$index)">
            <template #reference>
              <el-button type="danger" @click.stop>{{ _L['frontend.view.delete'] }}</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="showFieldEditor" :title="fieldEditorTitle" direction="rtl" size="80%" append-to-body
      @closed="disposeEditingNode">
      <el-container style="height: 100%;">
        <el-main>
          <schema-view v-if="editingNode" :key="editingNode.guid" :node="(editingNode as StructNode)"
            in-form="expandall" plain-text="left">
          </schema-view>
        </el-main>
        <el-footer>
          <br />
          <template v-if="node.readonly">
            <el-button @click="cancelFieldEdit">{{ _L['frontend.view.close'] }}</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="saveFieldEdit">{{ _L['frontend.view.save'] }}</el-button>
            <el-button @click="cancelFieldEdit">{{ _L['frontend.view.cancel'] }}</el-button>
          </template>
        </el-footer>
      </el-container>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import Sortable from 'sortablejs'
import { computed, onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import { schemaView, _L } from 'schema-node-vueview'
import { _LS, ArrayNode, getSchema, getSchemaNode, jsonClone, SchemaType, sformat, StructNode } from 'schema-node'
import type { AnySchemaNode } from 'schema-node'

// properties
const props = defineProps<{ node: ArrayNode }>()
const arrayNode: ArrayNode = toRaw(props.node)

// display
const activeCol = ref(0)
const elements = ref<StructNode[]>([])
const noClosable = ref<string[]>([])
const showFieldEditor = ref(false)
const editingNode = ref<StructNode | undefined>(undefined)
const editingIndex = ref(-1)
const isAddingField = ref(false)
const tableMaxHeight = 48 * 11
const fieldEditorTitle = computed(() => {
  const data = editingNode.value?.rawData || {}
  const display = _L.value(data.display) || data.name || _L.value['system.schema.structschema.unkown']
  return `${_L.value[isAddingField.value ? 'frontend.view.new' : 'frontend.view.edit']} ${display}`
})

const disposeEditingNode = () => {
  editingNode.value?.dispose()
  editingNode.value = undefined
  editingIndex.value = -1
  isAddingField.value = false
}

const openEditingNode = async (index: number, isAdd: boolean) => {
  const type = arrayNode.elementSchema?.name
  if (!type) return

  disposeEditingNode()
  isAddingField.value = isAdd
  editingIndex.value = isAdd ? -1 : index

  const sourceData = !isAdd && index >= 0 && index < elements.value.length
    ? jsonClone(elements.value[index].rawData)
    : {}
  const node = await getSchemaNode({ type }, sourceData)
  if (!(node instanceof StructNode)) {
    disposeEditingNode()
    return
  }

  editingNode.value = node
  showFieldEditor.value = true
}

// add/edit/del
const handleAddField = async () => {
  await openEditingNode(-1, true)
}

const handleEditField = async (index: number) => {
  activeCol.value = index
  await openEditingNode(index, false)
}

const saveFieldEdit = async () => {
  const node = editingNode.value
  if (!node || !node.valid) return

  const data = jsonClone(node.rawData)
  if (isAddingField.value) {
    arrayNode.addRow(undefined, data)
    activeCol.value = arrayNode.elements.length - 1
  }
  else if (editingIndex.value >= 0 && editingIndex.value < elements.value.length) {
    elements.value[editingIndex.value].data = data
    activeCol.value = editingIndex.value
  }

  showFieldEditor.value = false
}

const cancelFieldEdit = () => {
  showFieldEditor.value = false
}

const handleDeleteField = (index: number) => {
  const delRow = arrayNode.elements[index]
  if (!delRow) return
  arrayNode.delRows(index)
}

const moveFieldUp = (index: number) => {
  if (index <= 0) return
  arrayNode.swapRow(index, index - 1)
}

const handleRowClick = (row: any) => {
  const index = elementDisplay.findIndex(v => v.guid === row.guid)
  if (index >= 0) activeCol.value = index
}

const fieldRowClassName = ({ row }: any) => {
  if (row.require) return 'require-row'
  if (row.displayOnly) return 'displayonly-row'
  return ''
}

// sort
let sortble: Sortable | null = null
let sortbleTime = 0
const regSortable = () => {
  sortble?.destroy()
  if (arrayNode.readonly) return

  const el: any = document.querySelector(".struct-field-table .el-table__body-wrapper tbody")
  if (!el) {
    sortbleTime = setTimeout(regSortable, 200)
    return
  }
  sortble = Sortable.create(el, {
    draggable: ".el-table__row",
    onEnd(params: any) {
      let { oldIndex, newIndex } = params
      if (oldIndex === newIndex) return
      if (oldIndex == null || newIndex == null) return

      if (oldIndex < newIndex) {
        for (let i = oldIndex; i < newIndex; i++) {
          arrayNode.swapRow(i, i + 1)
        }
      }
      else {
        for (let i = oldIndex; i > newIndex; i--) {
          arrayNode.swapRow(i, i - 1)
        }
      }
    }
  })
}

// data change handler
let dataChangeHandler: Function | null = null
let baseChangeHandler: Function | null = null
let elementDisplay = reactive<{ guid: string, name: string, handler: Function, display: string, require: boolean, displayOnly: boolean, type: string, desc: string }[]>([])
onMounted(() => {
  let oldLength = 0
  dataChangeHandler = arrayNode.subscribe((action: any) => {
    const currlen = arrayNode.elements.length
    if (currlen !== oldLength || action === "swap") {
      const activeGuid = elements.value[activeCol.value]?.guid
      oldLength = currlen
      elements.value = [...arrayNode.elements] as StructNode[]

      for (let i = 0; i < arrayNode.elements.length; i++) {
        const ele: AnySchemaNode = arrayNode.elements[i]
        if (elementDisplay.length > i) {
          if (ele.guid === elementDisplay[i].guid) continue
          elementDisplay[i].handler()
        }
        const view = reactive<{
          guid: string,
          display: string,
          name: string,
          require: boolean,
          displayOnly: boolean,
          type: string,
          desc: string,
          handler: Function
        }>({
          guid: ele.guid,
          display: "",
          name: "",
          require: false,
          displayOnly: false,
          type: "",
          desc: "",
          handler: (): void => { }
        })
        view.handler = ele.subscribe(() => {
          const { name, display, require, displayOnly, type, desc } = ele.rawData
          view.name = name
          view.display = _L.value(display)
          view.require = require
          view.displayOnly = displayOnly
          view.type = type
          view.desc = _L.value(desc)
        }, true)
        elementDisplay[i] = view
      }

      for (let i = elementDisplay.length - 1; i >= arrayNode.elements.length; i--) {
        elementDisplay.pop()?.handler()
      }

      if (activeGuid) {
        const idx = elements.value.findIndex(v => v.guid === activeGuid)
        activeCol.value = idx >= 0 ? idx : (elements.value.length ? 0 : -1)
      }
      else if (activeCol.value >= elements.value.length) {
        activeCol.value = elements.value.length ? 0 : -1
      }

      if (showFieldEditor.value && !isAddingField.value && editingIndex.value >= 0) {
        const idx = editingIndex.value
        if (idx >= elements.value.length) {
          showFieldEditor.value = false
        }
      }

      setTimeout(regSortable, 0)
    }
  }, true)

  if (arrayNode.readonly) return

  const base = (arrayNode.parent as StructNode).getField("base")!
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
  disposeEditingNode()
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

:deep(.struct-field-table .el-table__row) {
  cursor: move;
}

:deep(.struct-field-table .el-table__row.require-row td.el-table__cell) {
  background: #edf7ff;
}

:deep(.struct-field-table .el-table__row.displayonly-row td.el-table__cell) {
  background: #fff9e8;
}
</style>