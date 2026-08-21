<template>
  <div style="width: 100%;">
    <el-table :class="arrayNode.readonly ? '' : 'struct-field-table'" :data="elementDisplay" style="width: 100%;" :border="true"
      :max-height="tableMaxHeight" header-align="left" :header-cell-style="tableHeaderCellStyle"
      :row-class-name="fieldRowClassName" :row-style="fieldRowStyle">
      <el-table-column align="left" prop="name" :label="_L['system.schema.struct.field.name']" min-width="140">
        <template #default="scope">
          <span>{{ scope.row.name || _L['frontend.view.anonymous'] }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="type" :label="_L['system.schema.struct.field.type']" min-width="150">
        <template #default="scope">
          <schema-view v-model="scope.row.type" :props="{ readOnly: true }" type='system.schema.node.type' text="left"></schema-view>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="display" :label="_L['system.schema.prop.common.display']" min-width="180">
        <template #default="scope">
          <span>{{ scope.row.display || scope.row.name || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="desc" :label="_L['system.schema.prop.common.description']" min-width="180">
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
            :title="formatLocaleString('frontend.view.confirmflddel', scope.row.display || scope.row.name || 'frontend.view.anonymous')"
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
          <schema-view v-if="editingNode" :key="editingNode.id" :node="(editingNode as StructNode)" label-width="300px" :debug="debug"
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
import { nextTick, onMounted, onUnmounted, ref, toRaw } from 'vue'
import { schemaView, _L } from 'schema-node-vue-view'
import { ArrayNode, ArrayType, deepClone, formatLocaleString, LocaleString, StringNode, StructNode } from 'schema-node-core';

// properties
const props = defineProps<{ node: ArrayNode, debug?: boolean, text?: any, labelWidth?: string }>()
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
const fieldEditorTitle = ref('')

const disposeEditingNode = () => {
  editingNode.value?.dispose()
  editingNode.value = undefined
  editingIndex.value = -1
  isAddingField.value = false
}

const openEditingNode = async (index: number, isAdd: boolean) => {
  const type = (arrayNode.type as ArrayType).element;
  if (!type) return

  disposeEditingNode()
  isAddingField.value = isAdd
  editingIndex.value = isAdd ? -1 : index

  const sourceData = !isAdd && index >= 0 && index < arrayNode.length
    ? deepClone(arrayNode.at(index)!.rawValue)
    : {}
  const node = type.create(sourceData, arrayNode);
  if (!(node instanceof StructNode)) {
    disposeEditingNode()
    return
  }

  const nameField = node.getAccessValue("name") as StringNode;
  const displayField = node.getAccessValue("display") as StructNode;
  const refreshTitle = () => {
    fieldEditorTitle.value = `${_L.value[ arrayNode.readonly ? 'frontend.view.view' : isAddingField.value ? 'frontend.view.new' : 'frontend.view.edit']} ${_L.value(displayField.getValue() as LocaleString) || nameField.getValue() || _L.value['frontend.view.anonymous']}`
  }
  node.recordSubscription(nameField.subscribe(refreshTitle))
  node.recordSubscription(displayField.subscribe(refreshTitle, true))

  editingNode.value = node
  showFieldEditor.value = true
}

// add/edit/del
const handleAddField = async () => await openEditingNode(-1, true);
const handleEditField = async (index: number) => await openEditingNode(index, false);

const saveFieldEdit = async () => {
  const node = editingNode.value
  if (!node || !node.isValid) return

  const data = deepClone(node.rawValue)
  if (isAddingField.value) {
    arrayNode.addRow(undefined, data)
  }
  else if (editingIndex.value >= 0 && editingIndex.value < arrayNode.length) {
    arrayNode.at(editingIndex.value)!.value = data
  }

  showFieldEditor.value = false
}

const cancelFieldEdit = () => {
  showFieldEditor.value = false
}

const handleDeleteField = (index: number) => {
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
  if (!arrayNode || arrayNode.readonly) return

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

      console.log("struct move row", oldIndex, newIndex)
      arrayNode.moveRow(oldIndex, newIndex)
    }
  })
}

// data change handler
let dataChangeHandler: Function | null = null
let elementDisplay = ref<{ guid: string, name: string, display: string, require: boolean, displayOnly: boolean, type: string, desc: string }[]>([])
onMounted(() => {
  dataChangeHandler = arrayNode.subscribeItem(async () => {
    const news = []
    for (let i = 0; i < arrayNode.length; i++) {
      const node = arrayNode.at(i)!
      news[i] = {
        guid: node.id,
        display: _L.value(node.getAccessValue("display")?.getValue() as LocaleString),
        name: node.getAccessValue("name")?.getValue() as string ?? _L.value['frontend.view.anonymous'],
        require: node.getAccessValue("require")?.getValue() as boolean ?? false,
        displayOnly: node.getAccessValue("displayonly")?.getValue() as boolean ?? false,
        type: node.getAccessValue("type")?.getValue() as string ?? '',
        desc: _L.value(node.getAccessValue("description")?.getValue() as LocaleString),
      }
    }
    elementDisplay.value = []
    await nextTick();
    elementDisplay.value = news
    setTimeout(regSortable, 10)
  }, true)

  if (arrayNode.readonly) return

  regSortable()
})

onUnmounted(() => {
  if (dataChangeHandler) dataChangeHandler()
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