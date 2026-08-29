<template>
  <el-container class="main main-panel">
    <el-header style="height: fit-content; width: 100%;">
      <el-form :model="state" style="display: flex;" hide-required-asterisk inline>
        <schema-view v-model="state.app" in-form :config="{
          type: 'system.schema.app',
          display: _LS('system.schema.app')
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
          <el-select v-if="downloadFromServer && schemaFormats.length" v-model="selectedFormat" style="width: 140px; margin-right: 0.5rem;"
            :placeholder="_L['frontend.view.format']">
            <el-option v-for="format in schemaFormats" :key="format" :label="format" :value="format" />
          </el-select>
          <el-button type="success" @click="download">{{ _L["frontend.view.confirm"] }}</el-button>
          <el-button type="info" @click="downloading = false">{{ _L["frontend.view.cancel"] }}</el-button>
        </template>
      </el-form>
    </el-header>
    <el-main>
      <el-table ref="appTableRef" :data="appSchemas" style="width: 100%; height: 70vh;" :border="true" header-align="left"
        :header-cell-style="tableHeaderCellStyle" @selection-change="handleSelection">
        <el-table-column v-if="downloading" type="selection" width="55"></el-table-column>
        <el-table-column align="left" prop="name" :label="_L['frontend.view.name']" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.error" style="color:red">{{
              scope.row.name }}</span>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" prop="display" :label="_L['frontend.view.display']" min-width="150">
          <template #default="scope">
            {{ _L(scope.row.display?.key ? scope.row.display : scope.row.name) }}
          </template>
        </el-table-column>
        <el-table-column align="left" prop="desc" :label="_L['frontend.view.desc']" min-width="150">
          <template #default="scope">
            {{ _L(scope.row.desc) }}
          </template>
        </el-table-column>
        <el-table-column align="left" header-align="center" :label="_L['frontend.view.oper']" width="440">
          <template #header>
            <a href="javascript:void(0)" v-if="state.app" @click="goback"
              style="text-decoration: underline; color: lightseagreen;">
              {{ _L["frontend.view.return"] }}
            </a>
            <span v-else>{{ _L["frontend.view.oper"] }}</span>
          </template>
          <template #default="scope">
            <el-button type="info" @click="handleEdit(scope.row, true)">
              {{ _L["frontend.view.view"] }}
            </el-button>
            <el-button type="success" @click="handleEdit(scope.row, false)">
              {{ _L["frontend.view.edit"] }}
            </el-button>
            <el-button v-if="!scope.row.hasFields && !scope.row.fields?.length" type="info" @click="choose(scope.row)">
              {{ _L["frontend.view.down"] }}
            </el-button>
            <el-button v-if="!scope.row.hasApps && !scope.row.apps?.length" type="primary"
              @click="showFields(scope.row)">
              {{ _L["frontend.view.fields"] }}
            </el-button>
            <el-button v-if="(scope.row.hasFields || scope.row.fields?.length) && enableWorkflow" type="warning"
              @click="showWorkflows(scope.row)">
              {{ _L["frontend.view.workflow"] }}
            </el-button>
            <el-popconfirm
              v-if="!scope.row.hasApps && !scope.row.apps?.length && !scope.row.hasFields && !scope.row.fields?.length && !scope.row.workflows?.length"
              :title="_L['frontend.view.confirmdelete']" :confirm-button-text="_L['YES']" :cancel-button-text="_L['NO']"
              :icon="Delete" @confirm="handleDelete(scope.row)">
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
      <el-button type="danger" @click="clearAllStorageAppSchemas" style="position: absolute;right: 3rem;">{{
        _L["frontend.view.clearcustomapps"] }}</el-button>
    </el-footer>

    <!-- app editor -->
    <el-drawer v-model="showAppEditor" :title="operation" direction="rtl" size="100%" append-to-body
      @closed="closeAppEditor">
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <el-form v-if="appNode" ref="editorRef" :model="appNode.rawValue!" label-width="160" label-position="left"
            style="width: 100%; height: 90%;">
            <div class="draw-view">
              <schema-view :node="(appNode as StructNode)" in-form="expandall" text="left" :header-cell-style="tableHeaderCellStyle"></schema-view>
            </div>
          </el-form>
        </el-main>
        <el-footer>
          <br />
          <template v-if="appNode?.readonly">
            <el-button @click="showAppEditor = false">{{ _L["frontend.view.close"] }}</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="confirmApp">{{ _L["frontend.view.save"] }}</el-button>
            <el-button @click="showAppEditor = false">{{ _L["frontend.view.cancel"] }}</el-button>
          </template>
        </el-footer>
      </el-container>
    </el-drawer>

    <!-- field list -->
    <el-drawer v-model="showFieldList" :title="appTitle" direction="rtl" size="100%" append-to-body>
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <el-table :data="fields" :row-class-name="fieldRowClassName" style="width: 100%; height: 65vh;" :border="true"
            header-align="left" :header-cell-style="tableHeaderCellStyle">
            <el-table-column align="left" prop="name" :label="_L['frontend.view.name']" min-width="120">
              <template #default="scope">
                <span v-if="scope.row.error" style="color:red">{{ scope.row.name }}</span>
                <span v-else>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column align="left" prop="display" :label="_L['frontend.view.display']" min-width="150">
              <template #default="scope">
                {{ _L(scope.row.display?.key ? scope.row.display : scope.row.name) }}
              </template>
            </el-table-column>
            <el-table-column align="left" prop="type" :label="_L['frontend.view.type']" min-width="120">
              <template #default="scope">
                <schema-view v-model="scope.row.type" :config="{
                  type: 'system.schema.type.rule.value',
                  readonly: true
                }" text="left"></schema-view>
              </template>
            </el-table-column>
            <el-table-column align="left" prop="desc" :label="_L['frontend.view.desc']" min-width="150">
              <template #default="scope">
                {{ _L(scope.row.desc) }}
              </template>
            </el-table-column>
            <el-table-column align="left" header-align="center" :label="_L['frontend.view.oper']" width="400">
              <template #header>
                <a href="javascript:void(0)" @click="handleFieldNew"
                  style="text-decoration: underline; color: lightseagreen;">
                  {{ _L["frontend.view.new"] }}
                </a>
              </template>
              <template #default="scope">
                <el-button type="info" @click="handleFieldEdit(scope.row, true)">
                  {{ _L["frontend.view.view"] }}
                </el-button>
                <el-button type="success" @click="handleFieldEdit(scope.row, false)">
                  {{ _L["frontend.view.edit"] }}
                </el-button>
                <el-button v-if="scope.$index > 0" type="warning" @click="moveFieldUp(scope.row)">
                  {{ _L["frontend.view.moveup"] }}
                </el-button>
                <el-popconfirm :title="_L['frontend.view.confirmdelete']" :confirm-button-text="_L['YES']"
                  :cancel-button-text="_L['NO']" :icon="Delete" @confirm="handleFieldDelete(scope.row)">
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
          <br />
          <el-button v-if="fields.length" type="primary" @click="tryit">{{ _L["frontend.view.tryit"] }}</el-button>
          <el-button @click="showFieldList = false">{{ _L["frontend.view.close"] }}</el-button>
        </el-footer>
      </el-container>
    </el-drawer>

    <!-- field editor -->
    <el-drawer v-model="showAppFieldEditor" :title="appFieldOper" direction="rtl" size="100%" append-to-body
      @closed="closeFieldEditor">
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <el-form v-if="appFieldNode" ref="fieldEditorRef" :model="appFieldNode.rawValue!" label-width="160"
            label-position="left" style="width: 100%; height: 90%;">
            <div class="draw-view">
              <schema-view :node="(appFieldNode as StructNode)" in-form="expandall" text="left" :header-cell-style="tableHeaderCellStyle"></schema-view>
            </div>
          </el-form>
        </el-main>
        <el-footer>
          <br />
          <template v-if="appFieldNode?.readonly">
            <el-button @click="showAppFieldEditor = false">{{ _L["frontend.view.close"] }}</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="confirmField">{{ _L["frontend.view.save"] }}</el-button>
            <el-button @click="showAppFieldEditor = false">{{ _L["frontend.view.cancel"] }}</el-button>
          </template>
        </el-footer>
      </el-container>
    </el-drawer>

    <!-- workflow list -->
    <el-drawer v-model="showWorkflowList" :title="appTitle" direction="rtl" size="100%" append-to-body>
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <el-table :data="workflows" style="width: 100%; height: 65vh;" :border="true" header-align="left"
            :header-cell-style="tableHeaderCellStyle">
            <el-table-column align="left" prop="name" :label="_L['system.schema.def.app.workflow.schema.name']"
              min-width="120" />
            <el-table-column align="left" prop="display" :label="_L['system.schema.def.app.workflow.schema.display']"
              min-width="150">
              <template #default="scope">
                {{ _L(scope.row.display?.key ? scope.row.display : scope.row.name) }}
              </template>
            </el-table-column>
            <el-table-column align="left" prop="desc" :label="_L['system.schema.def.app.workflow.schema.desc']"
              min-width="150">
              <template #default="scope">
                {{ _L(scope.row.desc) }}
              </template>
            </el-table-column>
            <el-table-column align="left" prop="active" :label="_L['system.schema.def.app.workflow.schema.active']"
              min-width="120">
              <template #default="scope">
                <schema-view v-model="scope.row.active" :config="{
                  type: NS_SYSTEM_BOOL,
                  readonly: true
                }" text="left"></schema-view>
              </template>
            </el-table-column>
            <el-table-column align="left" header-align="center" :label="_L['frontend.view.oper']" width="400">
              <template #header>
                <a href="javascript:void(0)" @click="handleWorkflowNew"
                  style="text-decoration: underline; color: lightseagreen;">
                  {{ _L["frontend.view.new"] }}
                </a>
              </template>
              <template #default="scope">
                <el-button type="info" @click="handleWorkflowEdit(scope.row, true)">
                  {{ _L["frontend.view.view"] }}
                </el-button>
                <el-button type="warning" @click="toggleWorkflow(scope.row, !scope.row.active)">
                  {{ scope.row.active ? _L["DEACTIVE"] : _L["ACTIVE"] }}
                </el-button>
                <el-button type="success" @click="handleWorkflowEdit(scope.row, false)">
                  {{ _L["frontend.view.edit"] }}
                </el-button>
                <el-popconfirm :title="_L['frontend.view.confirmdelete']" :confirm-button-text="_L['YES']"
                  :cancel-button-text="_L['NO']" :icon="Delete" @confirm="handleWorkflowDelete(scope.row)">
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
          <br />
          <el-button @click="showWorkflowList = false">{{ _L["frontend.view.close"] }}</el-button>
        </el-footer>
      </el-container>
    </el-drawer>

    <!-- workflow editor -->
    <el-drawer v-model="showWorkflowEditor" :title="appWorkflowOper" direction="rtl" size="100%" append-to-body
      @closed="closeWorkflowEditor">
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <el-form v-if="appWorkflowNode" ref="workflowEditorRef" :model="appWorkflowNode.rawValue!" label-width="160"
            label-position="left" style="width: 100%; height: 90%;">
            <div class="draw-view">
              <schema-view :node="(appWorkflowNode as StructNode)" in-form="expandall" text="left" :header-cell-style="tableHeaderCellStyle"></schema-view>
            </div>
          </el-form>
        </el-main>
        <el-footer>
          <br />
          <template v-if="appWorkflowNode?.readonly">
            <el-button @click="showWorkflowEditor = false">{{ _L["frontend.view.close"] }}</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="confirmWorkflow">{{ _L["frontend.view.save"] }}</el-button>
            <el-button @click="showWorkflowEditor = false">{{ _L["frontend.view.cancel"] }}</el-button>
          </template>
        </el-footer>
      </el-container>
    </el-drawer>

    <!-- try it -->
    <el-drawer v-model="showtryit" :title="_L['frontend.nav.tryit'] + appTitle" direction="rtl" size="100%"
      append-to-body destroy-on-close>
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <tryapp v-if="currApp" :app="currApp"></tryapp>
        </el-main>
        <el-footer>
          <br />
          <el-button @click="showtryit = false">{{ _L["frontend.view.close"] }}</el-button>
        </el-footer>
      </el-container>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { reactive, watch, ref, toRaw } from 'vue'

const tableHeaderCellStyle = {
  backgroundColor: 'var(--app-surface-muted)',
  color: 'var(--app-text)',
  borderColor: 'var(--app-border)'
}
import { _L, schemaView } from 'schema-node-vue-view'
import { _LS, isNull, StructNode, SchemaLoadState, NS_SYSTEM_BOOL, getNodeType, StructType, StringNode, LocaleString, Display, getPropertyValue, Disable, deepClone, ReadOnly } from 'schema-node-core'
import { ElForm, ElMessage } from 'element-plus'
import { clearAllStorageAppSchemas, removeStorageAppSchema, saveAllCustomAppSchemaToStroage, saveStorageAppSchema } from '../appSchema'
import tryapp from './tryapp.vue'
import { getSchemaServerProvider } from '../schema/provider/schemaServerProvider'
import { AppFieldSchema, AppSchema, AppWorkflowSchema, DataDerive, EnableStorage, getAppSchemaName, getAppType, getExportAppSchema, getSchemaFormats, NS_SYSTEM_SCHEMA_APP, NS_SYSTEM_SCHEMA_APP_FIELD, NS_SYSTEM_SCHEMA_APP_WORKFLOW, saveAppSchema } from 'schema-node-app'

//#region View

const enableWorkflow = getSchemaServerProvider() ? true : false
const appSchemas = ref<AppSchema[]>([])

const state = reactive({
  app: "",
  keyword: ""
})

if (localStorage["schema_man_appsearch"]) {
  try {
    const search = JSON.parse(localStorage["schema_man_appsearch"])
    if (search && typeof (search) === "object") {
      state.app = search.app || ""
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
  else
    state.app = ""
}

const goback = () => {
  const paths = state.app.split(".")
  state.app = paths.slice(0, paths.length - 1).join(".")
}

const choose = (schema: AppSchema) => {
  state.app = schema.name
}

const refresh = async () => {
  localStorage["schema_man_appsearch"] = JSON.stringify(state)
  const appType = await getAppType(state.app || "")
  appSchemas.value = appType ? Array.from(appType.getSubAppSchemas()) : []
}

watch(state, refresh, { immediate: true })

//#endregion

//#region Edit

const editorRef = ref<InstanceType<typeof ElForm>>()
const showAppEditor = ref(false)
const appNode = ref<StructNode | undefined>(undefined)
const operation = ref("")

let appWatchHandler: Function[] = []
let isNewApp = false

// create
const handleNew = async () => {
  isNewApp = true
  localStorage["schema_new_app"] = state.app

  const appSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_APP}.schema`) as StructType;
  appNode.value = appSchemaType!.create({}) as StructNode;
  showAppEditor.value = true

  const displayField = appNode.value!.getAccessValue("display") as StructNode;
  const containerField = appNode.value!.getAccessValue("container") as StringNode;
  const nameField = appNode.value!.getAccessValue("name") as StringNode;
  
  const refreshOperation = () => {
    operation.value = _L.value["frontend.view.new"] + " " + _L.value(displayField.value as LocaleString ?? getAppSchemaName(appNode.value?.rawValue as AppSchema) ?? "")
  }

  appWatchHandler.push(displayField.subscribe(refreshOperation));
  appWatchHandler.push(containerField.subscribe(refreshOperation));
  appWatchHandler.push(nameField.subscribe(refreshOperation, true));
}

// update
const handleEdit = async (row: any, readonly?: boolean) => {
  isNewApp = false;
  const appType = await getAppType(getAppSchemaName(row));
  if (!appType) return;

  const appSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_APP}.schema`) as StructType;
  appNode.value = appSchemaType!.create(appType.getAppSchema()) as StructNode;
  showAppEditor.value = true

  const displayField = appNode.value!.getAccessValue("display") as StructNode;
  const containerField = appNode.value!.getAccessValue("container") as StringNode;
  const nameField = appNode.value!.getAccessValue("name") as StringNode;
  
  const refreshOperation = () => {
    operation.value = _L.value[readonly ? "frontend.view.view" : "frontend.view.edit" ] + " " + _L.value(displayField.value as LocaleString ?? getAppSchemaName(appNode.value?.rawValue as AppSchema) ?? "")
  }

  appWatchHandler.push(displayField.subscribe(refreshOperation));
  appWatchHandler.push(containerField.subscribe(refreshOperation));
  appWatchHandler.push(nameField.subscribe(refreshOperation, true));
}

// delete
const handleDelete = async (row: any) => {
  const appType = await getAppType(getAppSchemaName(row))
  if (!appType) return;

  if ((appType.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider();
    if (provider) {
      const res = provider.deleteAppSchema(row.name);
      if (!res) {
        ElMessage.error(_L.value["frontend.view.cantdelapp"]);
        return;
      }
    }
  }
  removeStorageAppSchema(getAppSchemaName(row));
  appType.container?.removeSubAppSchema(row.name);
  return refresh();
}

// save
const confirmApp = async () => {
  const res = await editorRef.value?.validate();
  if (!res || !appNode.value?.isValid) return;///

  const data = appNode.value.submitValue as AppSchema;
  const appType = await getAppType(getAppSchemaName(data));

  if (isNewApp && appType) {
    ElMessage.error(_L.value["frontend.view.appnameexists"])
    return
  }

  if (!appType || ((appType.loadState || 0) & SchemaLoadState.Service)) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = await provider.saveAppSchema(data)
        if (!res) {
          ElMessage.error(_L.value["frontend.view.error"])
          return
        }
        data.loadState = (data.loadState || 0) | SchemaLoadState.Service
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

  saveAppSchema(data)
  saveStorageAppSchema(data)
  closeAppEditor()
  showAppEditor.value = false
  return refresh()
}

// close
const closeAppEditor = () => {
  appWatchHandler.forEach(handler => handler())
  appWatchHandler = []
  appNode.value?.dispose()
  appNode.value = undefined
}

//#endregion

//#region Field 

const showFieldList = ref(false)
const fields = ref<AppFieldSchema[]>([])
const appTitle = ref("")
let currApp: string | null = null

const showFields = async (row: any) => {
  currApp = getAppSchemaName(row);
  const appType = await getAppType(getAppSchemaName(row));
  appTitle.value = _L.value(appType?.getProperty(Display)?.getValue<LocaleString>() ?? appType?.name ?? "");
  fields.value = Array.from(appType?.getFields().map(f => f.getFieldSchema() as AppFieldSchema) ?? []);
  showFieldList.value = true
}

const fieldRowClassName = (data: { row: AppFieldSchema }) => {
  const { row } = data
  if (getPropertyValue(row, Disable)) return 'disable-row'
  if (getPropertyValue(row, DataDerive)) return 'push-row'
  if (!getPropertyValue(row, EnableStorage)) return 'frontend-row'
  return '';
}

//#region Field edit

const fieldEditorRef = ref<InstanceType<typeof ElForm>>()
const showAppFieldEditor = ref(false)
const appFieldNode = ref<StructNode | undefined>(undefined)
const appFieldOper = ref("")

let appFieldWatchHandler: Function[] = []

// create
const handleFieldNew = async () => {
  const appFieldSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_APP_FIELD}.schema`) as StructType;
  appFieldNode.value = appFieldSchemaType.create({ app: currApp! } as AppFieldSchema) as StructNode;

  const displayField = appFieldNode.value?.getAccessValue("display") as StructNode;
  const nameField = appFieldNode.value?.getAccessValue("name") as StringNode;
  const refreshOper = () => {
    appFieldOper.value = _L.value["frontend.view.new"] + " " + (_L.value(displayField.value as LocaleString) || nameField.value || "")
  }

  appFieldWatchHandler.push(displayField.subscribe(refreshOper));
  appFieldWatchHandler.push(nameField.subscribe(refreshOper, true));
  showAppFieldEditor.value = true
}

// update
const handleFieldEdit = async (row: any, readonly?: boolean) => {
  const appFieldSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_APP_FIELD}.schema`) as StructType;
  appFieldNode.value = appFieldSchemaType.create(deepClone(row)) as StructNode;
  if (readonly) appFieldNode.value.setPropertyValue(ReadOnly, true);

  showAppFieldEditor.value = true

  const displayField = appFieldNode.value?.getAccessValue("display") as StructNode;
  const nameField = appFieldNode.value?.getAccessValue("name") as StringNode;
  const refreshOper = () => {
    appFieldOper.value = _L.value[readonly ? "frontend.view.view" : "frontend.view.edit"] + " " + (_L.value(displayField.value as LocaleString) || nameField.value || "")
  }

  if (readonly) {
    refreshOper();
  }
  else {
    appFieldWatchHandler.push(displayField.subscribe(refreshOper));
    appFieldWatchHandler.push(nameField.subscribe(refreshOper, true));
  }
}

// delete
const handleFieldDelete = async (row: any) => {
  const appType = await getAppType(currApp!)
  const field = appType?.getField(row.name)
  if (!field) return

  if ((appType!.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = provider.deleteAppFieldSchema(appType!.name, row.name)
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

  if (appType) {
    appType.removeField(field.name);
    saveStorageAppSchema(appType.getSchema());
    fields.value = Array.from(appType.getFields().map(f => f.getFieldSchema() as AppFieldSchema));
  }
}

// move up
const moveFieldUp = async (row: any) => {
  const appType = await getAppType(currApp!)
  if (!appType) return;

  const index = fields.value.findIndex(f => f.name === row.name);
  if (index < 1) return;
  const other = fields.value[index - 1].name;

  if ((appType.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = provider.swapAppFieldSchema(appType.name, row.name, other)
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

  appType.swapField(row.name, other)
  saveStorageAppSchema(appType.getSchema())
  fields.value = Array.from(appType.getFields().map(f => f.getFieldSchema() as AppFieldSchema))
}

// save
const confirmField = async () => {
  const res = await fieldEditorRef.value?.validate();
  if (!res || !appFieldNode.value?.isValid) return;

  const data = appFieldNode.value.submitValue as AppFieldSchema;
  const appType = await getAppType(currApp!);
  if (!appType) return;

  if ((appType.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider();
    if (provider) {
      try {
        const res = await provider.saveAppFieldSchema(appType.name, data);
        if (!res) {
          ElMessage.error(_L.value["frontend.view.error"]);
          return;
        }
      }
      catch (ex: any) {
        if (ex && ex.status === 403) {
          ElMessage.error(_L.value["frontend.view.nopermission"]);
          return;
        }
        ElMessage.error(_L.value["frontend.view.error"]);
        console.error(ex);
        return;
      }
    }
  }

  appType.saveField(data);
  saveStorageAppSchema(appType.getSchema())
  fields.value = Array.from(appType.getFields().map(f => f.getFieldSchema() as AppFieldSchema))
  closeFieldEditor()
  showAppFieldEditor.value = false
}

// close
const closeFieldEditor = () => {
  appFieldWatchHandler.forEach(handler => handler())
  appFieldWatchHandler = []
  appFieldNode.value?.dispose()
  appFieldNode.value = undefined

  // forece refresh
  refresh()
}

//#endregion

//#endregion

//#region Workflows

const showWorkflowList = ref(false);
const workflows = ref<AppWorkflowSchema[]>([]);
const showWorkflows = async (row: any) => {
  currApp = getAppSchemaName(row);
  const appType = (await getAppType(currApp!))!
  appTitle.value = _L.value(appType.getProperty(Display)?.getValue<LocaleString>()) || appType?.name || ""
  workflows.value = Array.from(appType.getWorkflows().map(w => w.getWorkflowSchema() as AppWorkflowSchema))
  showWorkflowList.value = true
}

//#region Workflow Edit

const workflowEditorRef = ref<InstanceType<typeof ElForm>>();
const showWorkflowEditor = ref(false);
const appWorkflowNode = ref<StructNode | undefined>(undefined);
const appWorkflowOper = ref("");
let appWorkflowWatchHandler: Function[] = []

// create
const handleWorkflowNew = async () => {
  const appWorkflowSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_APP_WORKFLOW}.schema`) as StructType;
  appWorkflowNode.value = appWorkflowSchemaType.create({ app: currApp! }) as StructNode;

  const displayField = appWorkflowNode.value?.getAccessValue("display") as StructNode;
  const nameField = appWorkflowNode.value?.getAccessValue("name") as StringNode;
  const refreshOper = () => {
    appWorkflowOper.value = _L.value["frontend.view.new"] + " " + (_L.value(displayField.value as LocaleString) || nameField.value || "")
  }

  appWorkflowWatchHandler.push(displayField.subscribe(refreshOper));
  appWorkflowWatchHandler.push(nameField.subscribe(refreshOper, true));
  showWorkflowEditor.value = true
}

// update
const handleWorkflowEdit = async (row: any, readonly?: boolean) => {
  const appWorkflowSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_APP_WORKFLOW}.schema`) as StructType;
  appWorkflowNode.value = appWorkflowSchemaType.create(deepClone(row)) as StructNode;
  if (readonly) appWorkflowNode.value.setPropertyValue(ReadOnly, true);

  showWorkflowEditor.value = true

  const displayField = appWorkflowNode.value?.getAccessValue("display") as StructNode;
  const nameField = appWorkflowNode.value?.getAccessValue("name") as StringNode;
  const refreshOper = () => {
    appWorkflowOper.value = _L.value[readonly ? "frontend.view.view" : "frontend.view.edit"] + " " + (_L.value(displayField.value as LocaleString) || nameField.value || "")
  }

  if (readonly) {
    refreshOper();
  }
  else {
    appWorkflowWatchHandler.push(displayField.subscribe(refreshOper));
    appWorkflowWatchHandler.push(nameField.subscribe(refreshOper, true));
  }
}

// delete
const handleWorkflowDelete = async (row: any) => {
  const appType = await getAppType(currApp!)
  if (!appType) return
  if ((appType.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        const res = provider.deleteAppWorkflowSchema(appType.name, row.name)
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
  appType.removeWorkflow(row.name)
  saveStorageAppSchema(appType.getSchema())
  workflows.value = Array.from(appType.getWorkflows().map(w => w.getWorkflowSchema() as AppWorkflowSchema))
}

// save
const confirmWorkflow = async () => {
  const res = await workflowEditorRef.value?.validate();
  if (!res || !appWorkflowNode.value?.isValid) {
    ElMessage.error(appWorkflowNode.value?.error);
    return;
  }
  const data = appWorkflowNode.value.submitValue as AppWorkflowSchema;
  const appType = await getAppType(currApp!)
  if (!appType) return
  if ((appType.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider();
    if (provider) {
      try {
        // save workflow schema
        const res = await provider.saveAppWorkflowSchema(appType.name, data);
        if (!res) {
          ElMessage.error(_L.value["frontend.view.error"]);
          return;
        }
      }
      catch (ex: any) {
        if (ex && ex.status === 403) {
          ElMessage.error(_L.value["frontend.view.nopermission"]);
          return;
        }
        ElMessage.error(_L.value["frontend.view.error"]);
        console.error(ex);
        return;
      }
    }
  }

  appType.saveWorkflow(data);
  saveStorageAppSchema(appType.getSchema());
  workflows.value = Array.from(appType.getWorkflows().map(w => w.getWorkflowSchema() as AppWorkflowSchema));
  closeWorkflowEditor()
  showWorkflowEditor.value = false
}

// close
const closeWorkflowEditor = () => {
  appWorkflowWatchHandler.forEach(h => h());
  appWorkflowWatchHandler = [];
  appWorkflowNode.value?.dispose();
  appWorkflowNode.value = undefined;
}

// toggle
const toggleWorkflow = async (row: any, active: boolean) => {
  const appType = await getAppType(currApp!)
  if (!appType) return
  if ((appType.loadState || 0) & SchemaLoadState.Service) {
    const provider = getSchemaServerProvider()
    if (provider) {
      try {
        // toggle workflow schema
        const res = provider.toggleAppWorkflowSchema(appType.name, row.name, active)
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
  const data = appType.getWorkflow(row.name)?.getWorkflowSchema();
  if (!data) return
  data.active = active;
  appType.saveWorkflow(data);
  saveStorageAppSchema(appType.getSchema())
  workflows.value = Array.from(appType.getWorkflows().map(w => w.getWorkflowSchema() as AppWorkflowSchema))
}

//#endregion

//#endregion

//#region Try it

const showtryit = ref(false)

const tryit = () => {
  showtryit.value = true
}

//#endregion

//#region Download

const downloading = ref(false);
const appTableRef = ref<any>();
const schemaFormats = ref<string[]>([]);
const selectedFormat = ref<string>('');
const downloadFromServer = ref(false);
const APP_SCHEMA_DOWNLOAD_FORMAT_KEY = "schema_man_app_download_format";
let selections: string[] = [];

const startDownload = () => {
  selections = [];
  appTableRef.value?.clearSelection?.();

  const provider = getSchemaServerProvider();
  downloadFromServer.value = !!provider;
  if (provider) {
    schemaFormats.value = getSchemaFormats();
    const savedFormat = localStorage[APP_SCHEMA_DOWNLOAD_FORMAT_KEY] || '';
    selectedFormat.value = schemaFormats.value.includes(savedFormat) ? savedFormat : (schemaFormats.value[0] || '');
  }
  else {
    schemaFormats.value = [];
    selectedFormat.value = '';
  }

  downloading.value = true;
}

const handleSelection = (val: any[]) => {
  const selectedRows = val || [];
  if (!selectedRows.length) {
    selections = [];
    return
  }

  const row = selectedRows[selectedRows.length - 1];
  if (selectedRows.length > 1 && appTableRef.value) {
    appTableRef.value.clearSelection();
    appTableRef.value.toggleRowSelection(row, true);
  }
  selections = [row.name];
}

const download = async () => {
  if (!selections.length) {
    ElMessage.error(_L.value["frontend.view.error"]);
    return;
  }

  const appName = selections[0];
  const provider = getSchemaServerProvider();

  if (provider && downloadFromServer.value) {
    if (!selectedFormat.value) {
      ElMessage.error(_L.value["frontend.view.error"]);
      return;
    }

    try {
      await provider.getAppSchema(appName, true, selectedFormat.value);
      downloading.value = false;
    }
    catch (ex: any) {
      if (ex && ex.status === 403) {
        ElMessage.error(_L.value["frontend.view.nopermission"]);
        return;
      }
      ElMessage.error(_L.value["frontend.view.error"]);
      console.error(ex);
      return;
    }
    return;
  }

  const name = `${appName}.json`;
  const content = JSON.stringify(selections.map(s => getExportAppSchema(s!)), null, 2);

  // download
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  downloading.value = false;
}

watch(selectedFormat, (val) => {
  if (!val) return;
  localStorage[APP_SCHEMA_DOWNLOAD_FORMAT_KEY] = val;
})

const uploadSchema = (file: File) => {
  file.text().then(text => {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      saveAppSchema(data);
      saveAllCustomAppSchemaToStroage();
      return refresh();
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

.el-table .disable-row {
  background: gray;
}

html.dark .el-table .disable-row {
  background: #505866;
}

.el-table .ref-row {
  background: oldlace;
}

html.dark .el-table .ref-row {
  background: #463925;
}

.el-table .push-row {
  background: oldlace;
}

html.dark .el-table .push-row {
  background: #463925;
}

.el-table .frontend-row {
  background: lightcyan;
}

html.dark .el-table .frontend-row {
  background: #173743;
}
</style>