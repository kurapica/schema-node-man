<template>
  <div style="width: 100%;">
    <el-table :class="arrayNode.readonly ? '' : 'struct-field-table'" :data="elementDisplay" style="width: 100%;" :border="true"
      :max-height="tableMaxHeight" header-align="left" :header-cell-style="tableHeaderCellStyle"
      :row-class-name="fieldRowClassName" :row-style="fieldRowStyle">
      <el-table-column align="left" prop="name" :label="_L['frontend.view.name']" min-width="140">
        <template #default="scope">
          <span>{{ scope.row.name || _L['system.schema.def.struct.schema.unkown'] }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="type" :label="_L['frontend.view.type']" min-width="150">
        <template #default="scope">
          <schema-view v-model="scope.row.type" :config="{ type: 'system.schema.type.rule.value', readonly: true }"
            text="left"></schema-view>
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
          <el-button type="success" @click.stop="handleEditField(scope.$index)">{{ _L[arrayNode.readonly ? 'frontend.view.view' : 'frontend.view.edit']
          }}</el-button>
          <el-popconfirm
            v-if="!node.readonly && !scope.row.require && !(scope.row.name && noClosable.includes(scope.row.name))"
            :title="sformat('system.schema.def.struct.schema.confirmflddel', scope.row.display || scope.row.name || 'system.schema.def.struct.schema.anonymous')"
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
            in-form="expandall" text="left">
          </schema-view>
        </el-main>
        <el-footer>
          <br />
          <template v-if="arrayNode.readonly">
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
const tableHeaderCellStyle = {
  backgroundColor: 'var(--app-surface-muted)',
  color: 'var(--app-text)',
  borderColor: 'var(--app-border)'
}

// display
const noClosable = ref<string[]>([])
const showFieldEditor = ref(false)
const editingNode = ref<StructNode | undefined>(undefined)
const editingIndex = ref(-1)
const isAddingField = ref(false)
const tableMaxHeight = 48 * 11
const fieldEditorTitle = computed(() => {
  const data = editingNode.value?.rawData || {}
  const display = _L.value(data.display) || data.name || _L.value['system.schema.def.struct.schema.unkown']
  return `${_L.value[ arrayNode.readonly ? 'frontend.view.view' : isAddingField.value ? 'frontend.view.new' : 'frontend.view.edit']} ${display}`
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

  const sourceData = !isAdd && index >= 0 && index < arrayNode.elements.length
    ? jsonClone(arrayNode.elements[index].data)
    : {}
  const node = await getSchemaNode({ type, readonly: arrayNode.readonly }, sourceData)
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
  await openEditingNode(index, false)
}

const saveFieldEdit = async () => {
  const node = editingNode.value
  if (!node || !node.valid) return

  const data = jsonClone(node.rawData)
  if (isAddingField.value) {
    arrayNode.addRow(undefined, data)
  }
  else if (editingIndex.value >= 0 && editingIndex.value < arrayNode.elements.length) {
    arrayNode.elements[editingIndex.value].data = data
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

const fieldRowClassName = ({ row }: any) => {
  if (row.require) return 'require-row'
  if (row.displayOnly) return 'displayonly-row'
  return ''
}

const fieldRowStyle = ({ row }: any) => {
  const isDark = document.documentElement.classList.contains('dark')
  if (row.require) {
    return isDark
      ? {
          '--el-table-tr-bg-color': '#243a52',
          '--el-table-row-hover-bg-color': '#2b4867',
          color: '#eaf4ff'
        }
      : {
          '--el-table-tr-bg-color': '#edf7ff'
        }
  }
  if (row.displayOnly) {
    return isDark
      ? {
          '--el-table-tr-bg-color': '#4a3b16',
          '--el-table-row-hover-bg-color': '#5a4a1f',
          color: '#fff4d6'
        }
      : {
          '--el-table-tr-bg-color': '#fff9e8'
        }
  }
  return {}
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

      arrayNode.moveRow(oldIndex, newIndex)
    }
  })
}

// data change handler
let dataChangeHandler: Function | null = null
let baseChangeHandler: Function | null = null
let elementDisplay = ref<{ guid: string, name: string, display: string, require: boolean, displayOnly: boolean, type: string, desc: string }[]>([])
onMounted(() => {
  dataChangeHandler = arrayNode.subscribe(() => {
    const news = []
    for (let i = 0; i < arrayNode.elements.length; i++) {
      const data = arrayNode.elements[i].data
      news[i] = {
        guid: arrayNode.elements[i].guid,
        display: _L.value(data.display),
        name: data.name,
        require: data.require,
        displayOnly: data.displayOnly,
        type: data.type,
        desc: _L.value(data.desc),
      }
    }
    elementDisplay.value = news
    setTimeout(regSortable, 10)
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
    noClosable.value = fields.map((f:any) => f.name)

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
</style>