<template>
  <el-container class="main main-panel">
    <el-header style="height: fit-content; width: 100%;">
      <el-form :model="state" style="display: flex;" hide-required-asterisk inline>
        <schema-view v-model="state.namespace" in-form expand :config="{
          type: 'system.schema.type.namespace',
          display: _LS('system.schema.type.namespace')
        }"></schema-view>
        <schema-view v-model="state.type" in-form :config="{
          type: 'system.schema.def.schematype',
          display: _LS('system.schema.def.schematype')
        }"></schema-view>
        <schema-view v-model="state.keyword" in-form :config="{
          type: 'system.string',
          display: _LS('frontend.view.keyword')
        }"></schema-view>
        <el-button type="info" @click="reset">{{ _L["frontend.view.reset"] }}</el-button>
        <el-button type="primary" @click="handleNew">{{ _L["frontend.view.new"] }}</el-button>
        <!-- download -->
        <template v-if="!downloading">
          <el-button type="success" @click="startDownload">{{ _L["frontend.view.download"] }}</el-button>
          <el-upload style="padding-left:1rem;" :before-upload="uploadSchema" :limit="1" :show-file-list="false">
            <el-button type="success">{{ _L["frontend.view.upload"] }}</el-button>
          </el-upload>
        </template>
        <template v-else>
          <el-button type="success" @click="download">{{ _L["frontend.view.confirm"] }}</el-button>
          <el-button type="info" @click="downloading = false">{{ _L["frontend.view.cancel"] }}</el-button>
        </template>
      </el-form>
    </el-header>
    <el-main>
      <el-table :data="schemas" style="width: 100%; height: 70vh;" :border="true" header-align="left"
        :header-cell-style="tableHeaderCellStyle" @selection-change="handleSelection">
        <el-table-column v-if="downloading" type="selection" width="55"></el-table-column>
        <el-table-column align="left" prop="name" :label="_L['frontend.view.name']" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.error" style="color:red">{{ scope.row.name }}</span>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="type" :label="_L['frontend.view.type']" width="150">
          <template #default="scope">
            {{ _L['system.schema.def.schematype.' + scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column align="left" prop="display" :label="_L['frontend.view.display']" min-width="150">
          <template #default="scope">
            {{ _L(scope.row.display?.key ? scope.row.display : scope.row.name) }}
          </template>
        </el-table-column>
        <el-table-column align="left" header-align="center" :label="_L['frontend.view.oper']" width="280">
          <template #header>
            <a href="javascript:void(0)" v-if="state.namespace" @click="goback"
              style="text-decoration: underline; color: lightseagreen;">
              {{ _L["frontend.view.return"] }}
            </a>
            <span v-else>{{ _L["frontend.view.oper"] }}</span>
          </template>
          <template #default="scope">
            <el-button v-if="scope.row.kind === SCHEMA_KIND_NAMESPACE" type="info"
              @click="choose(scope.row)">{{ _L["frontend.view.down"] }}
            </el-button>
            <el-button v-else type="success" @click="handleEdit(scope.row, true)">
              {{ _L["frontend.view.view"] }}
            </el-button>
            <el-button type="warning"
              v-if="!((scope.row.loadState || 0) & SchemaLoadState.System) || scope.row.kind === SCHEMA_KIND_NAMESPACE"
              @click="handleEdit(scope.row, false)">
              {{ _L["frontend.view.edit"] }}
            </el-button>
            <el-popconfirm v-if="isSchemaDeletable(scope.row)" :title="_L['frontend.view.confirmdelete']"
              :confirm-button-text="_L['YES']" :cancel-button-text="_L['NO']" :icon="Delete"
              @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button type="danger">
                  {{ _L["frontend.view.delete"] }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-footer>
      <el-button type="danger" @click="clearAllStorageSchemas" style="position: absolute;right: 3rem;">{{
        _L["frontend.view.clearcustomschemas"] }}</el-button>
    </el-footer>

    <!-- namespace editor -->
    <el-drawer v-model="showNamespaceEditor" :title="operation" direction="rtl" size="100%" append-to-body
      @closed="closeNamespaceEditor">
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <el-form v-if="namespaceNode" ref="editorRef" :model="namespaceNode.rawValue!" label-width="160"
            label-position="left" style="width: 100%; height: 90%;">
            <div class="draw-view">
              <schema-view :node="(namespaceNode as StructNode)" in-form="expandall" text="left"></schema-view>
            </div>
          </el-form>
        </el-main>
        <el-footer>
          <br />
          <template v-if="namespaceNode?.readonly">
            <el-button v-if="tryitTypes.includes((namespaceNode.rawValue! as any).kind)" type="primary" @click="tryit">{{
              _L["frontend.view.tryit"] }}</el-button>
            <el-button @click="showNamespaceEditor = false">{{ _L["frontend.view.close"] }}</el-button>
            <el-button v-if="currRow?.usedBy?.length" @click="showViewRef = true"
              style="float:right" type="info">{{ _L["frontend.view.viewref"] }}</el-button>
            <el-button type="warning" @click="copySchema">{{ _L["frontend.view.copyschema"] }}</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="confirmNameSpace">{{ _L["frontend.view.save"] }}</el-button>
            <el-button @click="showNamespaceEditor = false">{{ _L["frontend.view.cancel"] }}</el-button>
          </template>
        </el-footer>
      </el-container>
    </el-drawer>

    <!-- try it -->
    <el-drawer v-model="showtryit"
      :title="_L['frontend.nav.tryit'] + ' - ' + (_L((namespaceNode?.rawValue as any)?.display) || getNodeSchemaName(namespaceNode?.rawValue as NodeSchema))"
      direction="rtl" size="100%" append-to-body destroy-on-close>
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <tryit-view :type="tryittype"></tryit-view>
        </el-main>
        <el-footer>
          <br />
          <el-button @click="showtryit = false">{{ _L["frontend.view.close"] }}</el-button>
        </el-footer>
      </el-container>
    </el-drawer>

    <!-- View ref -->
    <el-drawer v-model="showViewRef" :title="_L['frontend.view.viewref']" direction="rtl" size="40%" append-to-body>
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <template v-if="currRow?.usedBy?.length">
            <h3>{{ _L["system.schema.def.schematype"] }}</h3>
            <hr />
            <ul>
              <li v-for="type in currRow?.usedBy" :key="type">
                <schema-view :config="{
                  type: 'system.schema.type.any',
                  readonly: true
                }" :value="type" text="left"></schema-view>
              </li>
            </ul>
            <br />
          </template>
        </el-main>
        <el-footer>
          <br />
          <el-button @click="showViewRef = false">{{ _L["frontend.view.close"] }}</el-button>
        </el-footer>
      </el-container>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import { reactive, watch, ref, toRaw } from 'vue'
import { _L, schemaView } from 'schema-node-vue-view'
import { _LS, StructNode, isNull, SchemaLoadState, EnumNode, NodeSchema, SCHEMA_KIND_NAMESPACE, SCHEMA_KIND_BOOL, SCHEMA_KIND_STRING, SCHEMA_KIND_INT, SCHEMA_KIND_DECIMAL, SCHEMA_KIND_DATE, SCHEMA_KIND_ENUM, SCHEMA_KIND_STRUCT, SCHEMA_KIND_ARRAY, SCHEMA_KIND_FUNCTION, getNodeSchemaName, getNodeType, NamespaceType, matchKeyworkInLocaleString, getPropertyValue, Display, StructType, NS_SYSTEM_SCHEMA_NODE, BlackList, SCHEMA_KIND_OBJECT, ScalarNode, LocaleString, ReadOnly, getCachedNodeType, saveNodeSchema, INamespaceNodeType } from 'schema-node-core'
import { ElForm, ElMessage } from 'element-plus'
import { clearAllStorageSchemas, removeStorageSchema, saveAllCustomSchemaToStroage, saveStorageSchema } from '../schema'
import { getSchemaServerProvider } from '../schema/provider/schemaServerProvider'
import tryitView from './tryit.vue'
import { Delete } from '@element-plus/icons-vue'
import { SCHEMA_KIND_EVENT, SCHEMA_KIND_WORKFLOW } from 'schema-node-app'

const schemas = ref<NodeSchema[]>([]);
const tableHeaderCellStyle = {
  backgroundColor: 'var(--app-surface-muted)',
  color: 'var(--app-text)',
  borderColor: 'var(--app-border)'
};

const schemaTypeOrder: Record<string, number> = {
  [SCHEMA_KIND_OBJECT]: 1,
  [SCHEMA_KIND_NAMESPACE]:2,
  [SCHEMA_KIND_BOOL]: 3,
  [SCHEMA_KIND_INT]: 4,
  [SCHEMA_KIND_DECIMAL]: 5,
  [SCHEMA_KIND_STRING]: 6,
  [SCHEMA_KIND_DATE]: 7,
  [SCHEMA_KIND_ENUM]: 8,
  [SCHEMA_KIND_STRUCT]: 9,
  [SCHEMA_KIND_ARRAY]: 10,
  [SCHEMA_KIND_FUNCTION]: 11,
  [SCHEMA_KIND_EVENT]: 12,
  [SCHEMA_KIND_WORKFLOW]: 13,
};

const tryitTypes = [SCHEMA_KIND_STRUCT, SCHEMA_KIND_ARRAY];

const state = reactive({
  namespace: "",
  type: null,
  keyword: ""
})

if (localStorage["schema_man_search"]) {
  try {
    const search = JSON.parse(localStorage["schema_man_search"])
    if (search && typeof (search) === "object") {
      state.namespace = search.namespace || ""
      state.type = search.type || null
      state.keyword = search.keyword || ""
    }
  }
  catch {
    // pass
  }
}

const reset = () => {
  if (!isNull(state.keyword)) 
    state.keyword = ""
  else if (!isNull(state.type))
    state.type = null
  else
    state.namespace = ""
}

const goback = () => {
  const paths = state.namespace.split(".")
  state.namespace = paths.slice(0, paths.length - 1).join(".")
}

const choose = (schema: NodeSchema) => {
  state.namespace = getNodeSchemaName(schema)
}

const refresh = async () => {
  localStorage["schema_man_search"] = JSON.stringify(state)
  const nodeType = await getNodeType(state.namespace || "")
  if (nodeType instanceof NamespaceType) {
    let temp: NodeSchema[] = Array.from(nodeType.getSubNodeSchemas().filter(p => !p.name.includes("<")));
    if (state.type) temp = temp.filter(p => p.kind === state.type)
    if (state.keyword) temp = temp.filter(p => p.name.match(state.keyword) || matchKeyworkInLocaleString(state.keyword, getPropertyValue(p, Display)))
    temp.sort((a, b) => {
      if (schemaTypeOrder[a.kind] < schemaTypeOrder[b.kind]) return -1
      if (schemaTypeOrder[a.kind] < schemaTypeOrder[b.kind]) return 1
      return a.name < b.name ? -1 : 1
    })
    schemas.value = temp
  }
}

watch(state, refresh, { immediate: true })

const isSchemaDeletable = (schema: NodeSchema) => !((schema.loadState || 0) & SchemaLoadState.System) && !getCachedNodeType(getNodeSchemaName(schema))?.isUsed

//#region Schema Edit

const editorRef = ref<InstanceType<typeof ElForm>>()
const showNamespaceEditor = ref(false)
const namespaceNode = ref<StructNode | undefined>(undefined)
const operation = ref("")
const showViewRef = ref(false)
let isNewType = false

const namesapceWatchHandler: Function[] = []

// create
const handleNew = async (copySchema?: NodeSchema) => {
  isNewType = true
  localStorage["schema_new_namespace"] = state.namespace

  const nodeSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_NODE}.schema`) as StructType;
  namespaceNode.value = nodeSchemaType.create(copySchema ?? {}) as StructNode

  const typeField = namespaceNode.value.getAccessValue("kind") as EnumNode
  typeField.setPropertyValue(BlackList, [SCHEMA_KIND_OBJECT, SCHEMA_KIND_EVENT, SCHEMA_KIND_WORKFLOW]) // TODO: temporary
  showNamespaceEditor.value = true

  const displayField = namespaceNode.value.getAccessValue("display") as StructNode
  const namespaceField = namespaceNode.value.getAccessValue("namespace") as ScalarNode
  const nameField = namespaceNode.value.getAccessValue("name") as ScalarNode

  const refreshOperation = () => {
    operation.value = _L.value["frontend.view.new"] + " " + _L.value(displayField.value as LocaleString ?? getNodeSchemaName(namespaceNode.value?.rawValue as NodeSchema) ?? "")
  }

  namesapceWatchHandler.push(displayField.subscribe(refreshOperation));
  namesapceWatchHandler.push(namespaceField.subscribe(refreshOperation));
  namesapceWatchHandler.push(nameField.subscribe(refreshOperation, true));
}

// update
const currRow = ref<NodeSchema | null>(null)
const handleEdit = async (row: any, readonly?: boolean) => {
  isNewType = false
  currRow.value = row
  const schema = (await getNodeType(getNodeSchemaName(row)))?.getNodeSchema();

  const nodeSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_NODE}.schema`) as StructType;
  namespaceNode.value = nodeSchemaType.create(schema) as StructNode;
  if (readonly) namespaceNode.value.setPropertyValue(ReadOnly, true);
  showNamespaceEditor.value = true

  const displayField = namespaceNode.value.getAccessValue("display") as StructNode
  const namespaceField = namespaceNode.value.getAccessValue("namespace") as ScalarNode
  const nameField = namespaceNode.value.getAccessValue("name") as ScalarNode

  const refreshOperation = () => {
    operation.value = _L.value[readonly ? "frontend.view.view" : "frontend.view.edit"] + " " + _L.value(displayField.value as LocaleString ?? getNodeSchemaName(namespaceNode.value?.rawValue as NodeSchema) ?? "")
  }
  
  if (readonly) {
    refreshOperation()
  }
  else {
    namesapceWatchHandler.push(displayField.subscribe(refreshOperation));
    namesapceWatchHandler.push(namespaceField.subscribe(refreshOperation, true));
    namesapceWatchHandler.push(nameField.subscribe(refreshOperation, true));
  }
}

// delete
const handleDelete = async (row: any) => {
  const nodeType = await getNodeType(getNodeSchemaName(row));

  if (nodeType?.isUsed || (nodeType?.loadState ?? 0) & SchemaLoadState.System) {
    ElMessage.error(_L.value["frontend.view.cantdelschema"])
    return
  }
  if ((row.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = await provider.deleteSchema(row.name)
        if (!res) {
          ElMessage.error(_L.value["frontend.view.error"])
          return
        }
      }
      catch (ex: any) {
        if (ex && ex.status === 403) {
          ElMessage.error(_L.value["frontend.view.nopermission"])
          return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
      }
    }
  }
  removeStorageSchema(getNodeSchemaName(row));
  (nodeType?.namespace as INamespaceNodeType)?.removeSubNodeSchema(row.name);
  return refresh();
}

// save
const confirmNameSpace = async () => {
  const res = await editorRef.value?.validate()
  if (!res || !namespaceNode.value?.isValid) return

  const data = namespaceNode.value.submitValue as NodeSchema;
  const schema = getCachedNodeType(getNodeSchemaName(data))

  if (isNewType && (schema || await getNodeType(getNodeSchemaName(data)))) {
    ElMessage.error(_L.value["frontend.view.schemanameexists"])
    return
  }

  if (!schema || ((schema.loadState ?? 0) & SchemaLoadState.Service)) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = await provider.saveSchema(data)
        if (!res) {
          ElMessage.error(_L.value["frontend.view.error"])
          return
        }
        data.loadState = (data.loadState ?? 0) | SchemaLoadState.Service
      }
      catch (ex: any) {
        if (ex && ex.status === 403) {
          ElMessage.error(_L.value["frontend.view.nopermission"])
          return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
      }
    }
  }

  saveNodeSchema(data, data.loadState)
  saveStorageSchema(data)
  closeNamespaceEditor()
  showNamespaceEditor.value = false
  return refresh()
}

// close
const closeNamespaceEditor = () => {
  namesapceWatchHandler.forEach(watcher => watcher())
  namesapceWatchHandler.splice(0, namesapceWatchHandler.length)
  namespaceNode.value?.dispose()
  namespaceNode.value = undefined
  currRow.value = null
}

//#endregion

//#region Try it

const showtryit = ref(false)
const tryittype = ref("")

const tryit = () => {
  tryittype.value = getNodeSchemaName(namespaceNode.value?.rawValue as NodeSchema ?? {}) || ""
  showtryit.value = true
}

//#endregion

//#region Copy Schema

const copySchema = async () => {
  const schema = namespaceNode.value?.submitValue as NodeSchema;
  if (!schema) return;

  closeNamespaceEditor();
  showNamespaceEditor.value = false;
  await new Promise(resolve => setTimeout(resolve, 200)); // wait drawer close animation

  const name = `${schema.name}_copy`;
  schema.name = "";
  localStorage["schema_new_namespace"] = state.namespace;

  await handleNew(schema);
}

//#endregion

//#region Download

const downloading = ref(false)
let selections: string[] = []

const startDownload = () => {
  selections = []
  downloading.value = true
}

const handleSelection = (val: any[]) => {
  selections = val.map((v: any) => v.name)
}

const download = () => {
  if (!selections.length) return
  const name = selections.length > 1 ? "system.schema.json" : `${selections[0]}.json`
  const content = JSON.stringify(selections.map(getCachedNodeType).map(s => s?.getNodeSchema()), null, 2)

  // download
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  downloading.value = false
}

const uploadSchema = (file: File) => {
  file.text().then(text => {
    const data = JSON.parse(text)
    if (Array.isArray(data)) {
      saveNodeSchema(data, SchemaLoadState.FrontEnd)
      saveAllCustomSchemaToStroage()
      return refresh()
    }
  })
  return false
}

//#endregion

</script>

<style lang="css">
body {
  color: var(--app-text);
}

.main-panel {
  padding: 1rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--app-surface);
  color: var(--app-text);
}

.el-form-item .el-form-item {
  margin-bottom: 18px;
}
</style>