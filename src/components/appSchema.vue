<template>
    <el-container class="main">
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
                    <el-upload
                        style="padding-left:1rem;"
                        :before-upload="uploadSchema"
                        :limit="1"
                        :show-file-list="false">
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
            <el-table :data="appSchemas" style="width: 100%; height: 70vh;" :border="true"
                header-align="left" 
                :header-cell-style="{ background: '#eee' }"
                @selection-change="handleSelection">
                <el-table-column v-if="downloading" type="selection" width="55"></el-table-column>
                <el-table-column align="left" prop="name" :label="_L['frontend.view.name']" min-width="120">
                    <template #default="scope">
                       <span v-if="scope.row.status && scope.row.status != SchemaNodeStatus.Ready" style="color:red">{{ scope.row.name }}</span>
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
                        <el-button v-if="!scope.row.hasApps && !scope.row.apps?.length" type="primary" @click="showFields(scope.row)">
                            {{ _L["frontend.view.fields"] }}
                        </el-button>
                        <el-button v-if="(scope.row.hasFields || scope.row.fields?.length) && enableWorkflow " type="warning" @click="showWorkflows(scope.row)">
                            {{ _L["frontend.view.workflow"] }}
                        </el-button>
                        <el-popconfirm
                            v-if="!scope.row.hasApps && !scope.row.apps?.length && !scope.row.hasFields && !scope.row.fields?.length && !scope.row.workflows?.length" 
                            :title="_L['frontend.view.confirmdelete']"
                            :confirm-button-text="_L['YES']"
                            :cancel-button-text="_L['NO']"
                            :icon="Delete"
                            @confirm="handleDelete(scope.row)"
                            >
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
            <el-button type="danger" @click="clearAllStorageAppSchemas" style="position: absolute;right: 3rem;">{{ _L["frontend.view.clearcustomapps"] }}</el-button>
        </el-footer>

        <!-- app editor -->
        <el-drawer v-model="showAppEditor" :title="operation" direction="rtl" size="100%" append-to-body @closed="closeAppEditor">
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <el-form v-if="appNode" ref="editorRef" :model="appNode.rawData" label-width="160"
                        label-position="left" style="width: 100%; height: 90%;">
                        <div class="draw-view">
                            <schema-view
                                :node="(appNode as StructNode)"
                                in-form="expandall"
                                plain-text="left"
                            ></schema-view>
                        </div>
                    </el-form>
                </el-main>
                <el-footer>
                    <br/>
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
        <el-drawer v-model="showFieldList" :title="appTitle"  direction="rtl" size="100%" append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <el-table :data="fields" :row-class-name="fieldRowClassName" style="width: 100%; height: 65vh;" :border="true"
                        header-align="left" 
                        :header-cell-style="{ background: '#eee' }">
                        <el-table-column align="left" prop="name" :label="_L['frontend.view.name']" min-width="120">
                            <template #default="scope">
                            <span v-if="scope.row.status && scope.row.status != SchemaNodeStatus.Ready" style="color:red">{{ scope.row.name }}</span>
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
                                    type: 'system.schema.valuetype',
                                    readonly: true
                                }" plain-text="left"></schema-view>
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
                                <el-popconfirm
                                    :title="_L['frontend.view.confirmdelete']"
                                    :confirm-button-text="_L['YES']"
                                    :cancel-button-text="_L['NO']"
                                    :icon="Delete"
                                    @confirm="handleFieldDelete(scope.row)"
                                    >
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
                    <br/>
                    <el-button v-if="fields.length" type="primary" @click="tryit">{{ _L["frontend.view.tryit"] }}</el-button>
                    <el-button @click="showFieldList = false">{{ _L["frontend.view.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>

        <!-- field editor -->
        <el-drawer v-model="showAppFieldEditor" :title="appFieldOper" direction="rtl" size="100%" append-to-body @closed="closeFieldEditor">
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <el-form v-if="appFieldNode" ref="fieldEditorRef" :model="appFieldNode.rawData" label-width="160"
                        label-position="left" style="width: 100%; height: 90%;">
                        <div class="draw-view">
                            <schema-view
                                :node="(appFieldNode as StructNode)"
                                in-form="expandall"
                                plain-text="left"
                            ></schema-view>
                        </div>
                    </el-form>
                </el-main>
                <el-footer>
                    <br/>
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
        <el-drawer v-model="showWorkflowList" :title="appTitle"  direction="rtl" size="100%" append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main> 
                    <el-table :data="workflows" style="width: 100%; height: 65vh;" :border="true"
                        header-align="left" 
                        :header-cell-style="{ background: '#eee' }">
                        <el-table-column align="left" prop="name" :label="_L['system.schema.appworkflowschema.name']" min-width="120" />
                        <el-table-column align="left" prop="display" :label="_L['system.schema.appworkflowschema.display']" min-width="150">
                            <template #default="scope">
                                {{ _L(scope.row.display?.key ? scope.row.display : scope.row.name) }}
                            </template>
                        </el-table-column>
                        <el-table-column align="left" prop="desc" :label="_L['system.schema.appworkflowschema.desc']" min-width="150">
                            <template #default="scope">
                                {{ _L(scope.row.desc) }}
                            </template>
                        </el-table-column>
                        <el-table-column align="left" prop="active" :label="_L['system.schema.appworkflowschema.active']" min-width="120">
                            <template #default="scope">
                                <schema-view v-model="scope.row.active" :config="{
                                    type: NS_SYSTEM_BOOL,
                                    readonly: true
                                }" plain-text="left"></schema-view>
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
                                <el-popconfirm
                                    :title="_L['frontend.view.confirmdelete']"
                                    :confirm-button-text="_L['YES']"
                                    :cancel-button-text="_L['NO']"
                                    :icon="Delete"
                                    @confirm="handleWorkflowDelete(scope.row)"
                                    >
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
                    <br/>
                    <el-button @click="showWorkflowList = false">{{ _L["frontend.view.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>

        <!-- workflow editor -->
        <el-drawer v-model="showWorkflowEditor" :title="appWorkflowOper" direction="rtl" size="100%" append-to-body @closed="closeWorkflowEditor">
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <el-form v-if="appWorkflowNode" ref="workflowEditorRef" :model="appWorkflowNode.rawData" label-width="160"
                        label-position="left" style="width: 100%; height: 90%;">
                        <div class="draw-view">
                            <schema-view
                                :node="(appWorkflowNode as StructNode)"
                                in-form="expandall"
                                plain-text="left"
                            ></schema-view>
                        </div>
                    </el-form>
                </el-main>
                <el-footer>
                    <br/>
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
        <el-drawer v-model="showtryit" :title="_L['frontend.nav.tryit'] + appTitle" direction="rtl" size="100%" append-to-body destroy-on-close>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <tryapp v-if="currApp"
                        :app="currApp"
                    ></tryapp>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button @click="showtryit = false">{{ _L["frontend.view.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>
    </el-container>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { reactive, watch, ref, toRaw } from 'vue'
import { _L, schemaView } from 'schema-node-vueview'
import { _LS, type IAppSchema, type IAppFieldSchema, SchemaNodeStatus, getAppSchema, isNull, StructNode, jsonClone, registerAppSchema, removeAppSchema, SchemaLoadState, getAppCachedSchema, type IAppWorkflowSchema, NS_SYSTEM_BOOL } from 'schema-node'
import { ElForm, ElMessage } from 'element-plus'
import { appSchemaToJson, clearAllStorageAppSchemas, removeStorageAppSchema, saveAllCustomAppSchemaToStroage, saveStorageAppSchema } from '../appSchema'
import tryapp from './tryapp.vue'
import { getSchemaServerProvider } from '../schemaServerProvider'

//#region View

const enableWorkflow = getSchemaServerProvider() ? true : false

const appSchemas = ref<IAppSchema[]>([])

const state = reactive({
    app: "",
    keyword: ""
})

if (localStorage["schema_man_appsearch"])
{
    try
    {
        const search = JSON.parse(localStorage["schema_man_appsearch"])
        if (search && typeof(search) === "object")
        {
            state.app = search.app || ""
            state.keyword = search.keyword || ""
        }
    }
    catch{
        // pass
    }
}

const reset = () => {
    if (!isNull(state.keyword))
    {
        state.keyword = ""
    }
    else
    {
        state.app = ""
    }
}

const goback = () => {
    const paths = state.app.split(".")
    state.app = paths.slice(0, paths.length - 1).join(".")
}

const choose = (schema: IAppSchema) => {
    state.app = schema.name
}

const refresh = async () => {
    localStorage["schema_man_appsearch"] = JSON.stringify(state)
    const appSchema = await getAppSchema(state.app || "")
    appSchemas.value = appSchema?.apps ? [...appSchema.apps] : []
}

watch(state, refresh, { immediate: true })

//#endregion

//#region Edit

const editorRef = ref<InstanceType<typeof ElForm>>()
const showAppEditor = ref(false)
const appNode = ref<StructNode | undefined>(undefined)
const operation = ref("")

let appWatchHandler: Function | null = null
let isNewApp = false

// create
const handleNew = async () => {
    isNewApp = true
    localStorage["schema_new_app"] = state.app

    appNode.value = new StructNode({
        type: "system.schema.appschema",
    }, {})
    showAppEditor.value = true

    appWatchHandler = appNode.value.subscribe(() => {
        operation.value = _L.value["frontend.view.new"] + " " + (_L.value(appNode.value?.data.display) || appNode.value?.data.name || "")
    }, true)
}

// update
const handleEdit = async (row: any, readonly?: boolean) => {
    isNewApp = false
    const schema = await getAppSchema(row.name)
    appNode.value = new StructNode({
        type: "system.schema.appschema",
        readonly
    }, jsonClone(schema))
    showAppEditor.value = true

    if (readonly) {
        operation.value = _L.value["frontend.view.view"] + " " + (_L.value(appNode.value?.data.display) || appNode.value?.data.name || "")
    }
    else {
        appWatchHandler = appNode.value.subscribe(() => {
            operation.value = _L.value["frontend.view.edit"] + " " + (_L.value(appNode.value?.data.display) || appNode.value?.data.name || "")
        }, true)
    }
}

// delete
const handleDelete = (row: any) => {
    if ((row.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            const res = provider.deleteAppSchema(row.name)
            if (!res) {
                ElMessage.error(_L.value["frontend.view.cantdelapp"])
                return
            }
        }
    }
    removeStorageAppSchema(row.name)
    removeAppSchema(row.name)
    return refresh()
}

// save
const confirmApp = async () => {
    const res = await editorRef.value?.validate()
    if (!res || !appNode.value?.valid) return

    if (!appNode.value?.valid) return
    const data = jsonClone(toRaw(appNode.value.data))
    const schema = getAppCachedSchema(data.name)

    if (isNewApp && (schema || await getAppSchema(data.name)))
    {
        ElMessage.error(_L.value["frontend.view.appnameexists"])
        return
    }

    if (!schema || ((schema.loadState || 0) & SchemaLoadState.Server))
    {
        const provider = getSchemaServerProvider()
        if (provider){
            try
            {
                const res = await provider.saveAppSchema(data)
                if (!res) {
                    ElMessage.error(_L.value["frontend.view.error"])
                    return
                }
                data.loadState = (data.loadState || 0) | SchemaLoadState.Server
            }
            catch (ex: any)
            {
                if (ex && ex.status === 403)
                {
                    ElMessage.error(_L.value["frontend.view.nopermission"])
                    return
                }
                ElMessage.error(_L.value["frontend.view.error"])
                console.error(ex)
                return
            }
        }
    }
    
    registerAppSchema([data], data.loadState)
    saveStorageAppSchema(data)
    closeAppEditor()
    showAppEditor.value = false
    return refresh()
}

// close
const closeAppEditor = () => {
    if (appWatchHandler) appWatchHandler()
    appNode.value?.dispose()
    appNode.value = undefined
    appWatchHandler = null
}

//#endregion

//#region Field 

const showFieldList = ref(false)
const fields = ref<IAppFieldSchema[]>([])
const appTitle = ref("")
let currApp: string | null = null

const showFields = async(row: any) => {
    currApp = row.name
    const appSchema = await getAppSchema(row.name)
    appTitle.value = _L.value(appSchema?.display) || appSchema?.name || ""
    fields.value = appSchema?.fields ? [...appSchema.fields] : []
    showFieldList.value = true
}

const fieldRowClassName = (data: any) => {
    const { row } = data
    if (row.disable) return 'disable-row'
    if (row.sourceApp) return 'ref-row'
    if (row.func) return 'push-row'
    if (row.frontend) return 'frontend-row'
    return '';
}

//#region Field edit

const fieldEditorRef = ref<InstanceType<typeof ElForm>>()
const showAppFieldEditor = ref(false)
const appFieldNode = ref<StructNode | undefined>(undefined)
const appFieldOper = ref("")

let appFieldWatchHandler: Function | null = null

// create
const handleFieldNew = async () => {
    appFieldNode.value = new StructNode({
        type: "system.schema.appfieldschema",
    }, { app: currApp! })
    showAppFieldEditor.value = true

    appFieldWatchHandler = appFieldNode.value.subscribe(() => {
        appFieldOper.value = _L.value["frontend.view.new"] + " " + (_L.value(appFieldNode.value?.data.display) || appFieldNode.value?.data.name || "")
    }, true)
}

// update
const handleFieldEdit = async (row: any, readonly?: boolean) => {
    appFieldNode.value = new StructNode({
        type: "system.schema.appfieldschema",
        readonly
    }, jsonClone(toRaw(row)))
    showAppFieldEditor.value = true

    if (readonly) {
        appFieldOper.value = _L.value["frontend.view.view"] + " " + (_L.value(appFieldNode.value?.data.display) || appFieldNode.value?.data.name || "")
    }
    else {
        appFieldWatchHandler = appFieldNode.value.subscribe(() => {
            appFieldOper.value = _L.value["frontend.view.edit"] + " " + (_L.value(appFieldNode.value?.data.display) || appFieldNode.value?.data.name || "")
        }, true)
    }
}

// delete
const handleFieldDelete = async (row: any) => {
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema?.fields) return

    if ((appSchema.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            try {
                const res = provider.deleteAppFieldSchema(appSchema.name, row.name)
                if (!res) {
                    ElMessage.error(_L.value["frontend.view.error"])
                    return
                }
            }
            catch (ex: any)
            {
                if (ex && ex.status === 403)
                {
                    ElMessage.error(_L.value["frontend.view.nopermission"])
                    return
                }
                ElMessage.error(_L.value["frontend.view.error"])
                console.error(ex)
                return
            }
        }
    }

    const idx =  appSchema.fields.findIndex(f => f.name === row.name)
    if (idx! >= 0)
    {
        appSchema.fields.splice(idx, 1)
        saveStorageAppSchema(appSchema)
        fields.value = appSchema?.fields ? [...appSchema.fields] : []
    }
}

// move up
const moveFieldUp = async (row: any) => {
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema?.fields) return

    const idx =  appSchema.fields.findIndex(f => f.name === row.name)
    if (idx <= 0) return
    const temp = appSchema.fields[idx - 1]
    if ((appSchema.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            try
            {
                const res = provider.swapAppFieldSchema(appSchema.name, row.name, temp.name)
                if (!res) {
                    ElMessage.error(_L.value["frontend.view.error"])
                    return
                }
            }
            catch (ex: any)
            {
                if (ex && ex.status === 403)
                {
                    ElMessage.error(_L.value["frontend.view.nopermission"])
                    return
                }
                ElMessage.error(_L.value["frontend.view.error"])
                console.error(ex)
                return
            }
        }
    }

    appSchema.fields[idx - 1] = appSchema.fields[idx]
    appSchema.fields[idx] = temp
    saveStorageAppSchema(appSchema)
    fields.value = appSchema?.fields ? [...appSchema.fields] : []
}

// save
const confirmField = async () => {
    const res = await fieldEditorRef.value?.validate()
    if (!res || !appFieldNode.value?.valid) return

    if (!appFieldNode.value?.valid) return
    const data = jsonClone(toRaw(appFieldNode.value.data))
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema) return

    if ((appSchema.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider){
            try {
                const res = await provider.saveAppFieldSchema(appSchema.name, data)
                if (!res) {
                    ElMessage.error(_L.value["frontend.view.error"])
                    return
                }
            }
            catch (ex: any)
            {
                if (ex && ex.status === 403)
                {
                    ElMessage.error(_L.value["frontend.view.nopermission"])
                    return
                }
                ElMessage.error(_L.value["frontend.view.error"])
                console.error(ex)
                return
            }
        }
    }

    if (!appSchema.fields) appSchema.fields = []
    const idx =  appSchema.fields.findIndex(f => f.name === data.name)
    if (idx! >= 0)
    {
        appSchema.fields[idx] = data
    }
    else
    {
        appSchema.fields.push(data)
    }

    saveStorageAppSchema(appSchema)
    fields.value = appSchema?.fields ? [...appSchema.fields] : []
    closeFieldEditor()
    showAppFieldEditor.value = false
}

// close
const closeFieldEditor = () => {
    if (appFieldWatchHandler) appFieldWatchHandler()
    appFieldNode.value?.dispose()
    appFieldNode.value = undefined
    appFieldWatchHandler = null
    
    // forece refresh
    refresh()
}

//#endregion

//#endregion

//#region Workflows

const showWorkflowList = ref(false)
const workflows = ref<IAppWorkflowSchema[]>([])
const showWorkflows = async(row: any) => {
    currApp = row.name
    const appSchema = await getAppSchema(row.name)
    appTitle.value = _L.value(appSchema?.display) || appSchema?.name || ""
    workflows.value = appSchema?.workflows ? [...appSchema.workflows] : []
    showWorkflowList.value = true
}

//#region Workflow Edit

const workflowEditorRef = ref<InstanceType<typeof ElForm>>()
const showWorkflowEditor = ref(false)
const appWorkflowNode = ref<StructNode | undefined>(undefined)
const appWorkflowOper = ref("")
let appWorkflowWatchHandler: Function | null = null

// create
const handleWorkflowNew = async () => {
    appWorkflowNode.value = new StructNode({
        type: "system.schema.appworkflowschema",
    }, { app: currApp! })
    showWorkflowEditor.value = true

    appWorkflowWatchHandler = appWorkflowNode.value.subscribe(() => {
        appWorkflowOper.value = _L.value["frontend.view.new"] + " " + (_L.value(appWorkflowNode.value?.data.display) || appWorkflowNode.value?.data.name || "")
    }, true)
}

// update
const handleWorkflowEdit = async (row: any, readonly?: boolean) => {
    appWorkflowNode.value = new StructNode({
        type: "system.schema.appworkflowschema",
        readonly
    }, jsonClone(toRaw(row)))
    showWorkflowEditor.value = true
}

// delete
const handleWorkflowDelete = async (row: any) => {
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema?.workflows) return
    if ((appSchema.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            try
            {
                const res = provider.deleteAppWorkflowSchema(appSchema.name, row.name)
                if (!res) {
                    ElMessage.error(_L.value["frontend.view.error"])
                    return
                }
            }
            catch (ex: any)
            {
                if (ex && ex.status === 403)
                {
                    ElMessage.error(_L.value["frontend.view.nopermission"])
                    return
                }
                ElMessage.error(_L.value["frontend.view.error"])
                console.error(ex)
                return
            }
        }
    }
    appSchema.workflows = appSchema.workflows.filter(w => w.name !== row.name)
    saveStorageAppSchema(appSchema)
    workflows.value = appSchema?.workflows ? [...appSchema.workflows] : []
}

// save
const confirmWorkflow = async () => {
    const res = await workflowEditorRef.value?.validate()
    if (!res || !appWorkflowNode.value?.valid) {
        ElMessage.error(appWorkflowNode.value?.error)
        return
    }
    if (!appWorkflowNode.value?.valid) return
    const data = jsonClone(toRaw(appWorkflowNode.value.data))
    console.log("workflow data:", data)
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema) return
    if ((appSchema.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider){
            try {
                // save workflow schema
                if (data.name && data.name !== appSchema.name)
                {
                    const res = await provider.saveAppWorkflowSchema(appSchema.name, data)
                    if (!res) {
                        ElMessage.error(_L.value["frontend.view.error"])
                        return
                    }
                }
            }
            catch (ex: any)
            {
                if (ex && ex.status === 403)
                {
                    ElMessage.error(_L.value["frontend.view.nopermission"])
                    return
                }
                ElMessage.error(_L.value["frontend.view.error"])
                console.error(ex)
                return
            }
        }
    }
    if (!appSchema.workflows) appSchema.workflows = []
    const idx =  appSchema.workflows.findIndex(w => w.name === data.name)
    if (idx! >= 0)
    {
        appSchema.workflows[idx] = data
    }
    else
    {
        appSchema.workflows.push(data)
    }
    saveStorageAppSchema(appSchema)
    workflows.value = appSchema?.workflows ? [...appSchema.workflows] : []
    closeWorkflowEditor()
    showWorkflowEditor.value = false
}

// close
const closeWorkflowEditor = () => {
    if (appWorkflowWatchHandler) appWorkflowWatchHandler()
    appWorkflowNode.value?.dispose()
    appWorkflowNode.value = undefined
    appWorkflowWatchHandler = null
}

// toggle
const toggleWorkflow = async (row: any, active: boolean) =>
{
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema?.workflows) return
    if ((appSchema.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            try
            {
                // toggle workflow schema
                if (row.name && row.name !== appSchema.name)
                {
                    const res = provider.toggleAppWorkflowSchema(appSchema.name, row.name, active)
                    if (!res) {
                        ElMessage.error(_L.value["frontend.view.error"])
                        return
                    }
                }
            }
            catch (ex: any)
            {
                if (ex && ex.status === 403)
                {
                    ElMessage.error(_L.value["frontend.view.nopermission"])
                    return
                }
                ElMessage.error(_L.value["frontend.view.error"])
                console.error(ex)
                return
            }
        }
    }
    const idx =  appSchema.workflows.findIndex(w => w.name === row.name)
    if (idx! >= 0)
        appSchema.workflows[idx].active = active
    saveStorageAppSchema(appSchema)
    workflows.value = appSchema?.workflows ? [...appSchema.workflows] : []
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
    const name = selections.length > 1 ? "appschema.json" : `${selections[0]}.json` 
    const content = JSON.stringify(selections.map(getAppCachedSchema).map(s => appSchemaToJson(s!)), null, 2)

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

const uploadSchema = (file:File)=>{
    file.text().then(text => {
        const data = JSON.parse(text)
        if (Array.isArray(data))
        {
            registerAppSchema(data, SchemaLoadState.Custom)
            saveAllCustomAppSchemaToStroage()
            return refresh()
        }
    })
    return false
}

//#endregion

</script>

<style lang="css">
body {
    color: black;
}
.el-form-item .el-form-item {
    margin-bottom: 18px;
}
.el-table .disable-row {
    background: gray;
}
.el-table .ref-row {
    background: oldlace;
}
.el-table .push-row {
    background: oldlace;
}
.el-table .frontend-row{
    background: lightcyan;
}
</style>