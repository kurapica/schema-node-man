<template>
    <el-container class="main">
        <el-header style="height: fit-content; width: 100%;">
            <el-form :model="state" style="display: flex;" hide-required-asterisk inline>
                <schema-view v-model="state.app" in-form :config="{
                    type: 'schema.app.srcapp',
                    display: _LS('schema.app.srcapp')
                }"></schema-view>
                <schema-view v-model="state.keyword" in-form :config="{
                    type: 'system.string',
                    display: _LS('schema.designer.keyword')
                }"></schema-view>
                <el-button type="info" @click="reset">{{ _L["schema.designer.reset"] }}</el-button>
                <el-button type="primary" @click="handleNew">{{ _L["schema.designer.new"] }}</el-button>
                <!-- download -->
                <template v-if="!downloading">
                    <el-button type="success" @click="startDownload">{{ _L["schema.designer.download"] }}</el-button>
                    <el-upload
                        style="padding-left:1rem;"
                        :before-upload="uploadSchema"
                        :limit="1"
                        :show-file-list="false">
                        <el-button type="success">{{ _L["schema.designer.upload"] }}</el-button>
                    </el-upload>
                </template>
                <template v-else>
                    <el-button type="success" @click="download">{{ _L["schema.designer.confirm"] }}</el-button>
                    <el-button type="info" @click="downloading = false">{{ _L["schema.designer.cancel"] }}</el-button>
                </template>
            </el-form>
        </el-header>
        <el-main>
            <el-table :data="appSchemas" style="width: 100%; height: 70vh;" :border="true"
                header-align="left" 
                :header-cell-style="{ background: '#eee' }"
                @selection-change="handleSelection">
                <el-table-column v-if="downloading" type="selection" width="55"></el-table-column>
                <el-table-column align="left" prop="name" :label="_L['schema.designer.name']" min-width="120" />
                <el-table-column align="left" prop="display" :label="_L['schema.designer.display']" min-width="150">
                    <template #default="scope">
                        {{ _L(scope.row.display) }}
                    </template>
                </el-table-column>
                <el-table-column align="left" prop="desc" :label="_L['schema.designer.desc']" min-width="150">
                    <template #default="scope">
                        {{ _L(scope.row.desc) }}
                    </template>
                </el-table-column>
                <el-table-column align="left" header-align="center" :label="_L['schema.designer.oper']" width="440">
                    <template #header>
                        <a href="javascript:void(0)" v-if="state.app" @click="goback"
                            style="text-decoration: underline; color: lightseagreen;">
                            {{ _L["schema.designer.return"] }}
                        </a>
                        <span v-else>{{ _L["schema.designer.oper"] }}</span>
                    </template>
                    <template #default="scope">
                        <el-button type="info" @click="handleEdit(scope.row, true)">
                            {{ _L["schema.designer.view"] }}
                        </el-button>
                        <el-button type="success" @click="handleEdit(scope.row, false)">
                            {{ _L["schema.designer.edit"] }}
                        </el-button>
                        <el-button v-if="!scope.row.hasFields && !scope.row.fields?.length" type="info" @click="choose(scope.row)">
                            {{ _L["schema.designer.down"] }}
                        </el-button>
                        <el-button v-if="!scope.row.hasApps && !scope.row.apps?.length" type="primary" @click="showFields(scope.row)">
                            {{ _L["schema.designer.fields"] }}
                        </el-button>
                        <el-popconfirm
                            v-if="!scope.row.hasApps && !scope.row.apps?.length && !scope.row.hasFields && !scope.row.fields?.length" 
                            :title="_L['schema.designer.confirmdelete']"                            
                            :confirm-button-text="_L['YES']"
                            :cancel-button-text="_L['NO']"
                            :icon="Delete"
                            @confirm="handleDelete(scope.row)"
                            >
                            <template #reference>
                                <el-button type="danger">
                                    {{ _L["schema.designer.delete"] }}
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer>
            <el-button type="danger" @click="clearAllStorageAppSchemas" style="position: absolute;right: 3rem;">{{ _L["schema.designer.clearcustomapps"] }}</el-button>
        </el-footer>

        <!-- app editor -->
        <el-drawer v-model="showAppEditor" :title="operation" direction="rtl" size="100%" destroy-on-close
            append-to-body @closed="closeAppEditor">
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
                        <el-button @click="showAppEditor = false">{{ _L["schema.designer.close"] }}</el-button>
                    </template>
                    <template v-else>
                        <el-button type="primary" @click="confirmApp">{{ _L["schema.designer.save"] }}</el-button>
                        <el-button @click="showAppEditor = false">{{ _L["schema.designer.cancel"] }}</el-button>
                    </template>
                </el-footer>
            </el-container>
        </el-drawer>

        <!-- field list -->
        <el-drawer v-model="showFieldList" :title="appTitle"  direction="rtl" size="100%" destroy-on-close append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <el-table :data="fields" :row-class-name="fieldRowClassName" style="width: 100%; height: 65vh;" :border="true"
                        header-align="left" 
                        :header-cell-style="{ background: '#eee' }">
                        <el-table-column align="left" prop="name" :label="_L['schema.designer.name']" min-width="120" />
                        <el-table-column align="left" prop="display" :label="_L['schema.designer.display']" min-width="150">
                            <template #default="scope">
                                {{ _L(scope.row.display) }}
                            </template>
                        </el-table-column>
                        <el-table-column align="left" prop="type" :label="_L['schema.designer.type']" min-width="120">
                            <template #default="scope">
                                <schema-view v-model="scope.row.type" :config="{
                                    type: 'schema.valuetype',
                                    readonly: true
                                }" plain-text="left"></schema-view>
                            </template>
                        </el-table-column>
                        <el-table-column align="left" prop="desc" :label="_L['schema.designer.desc']" min-width="150">
                            <template #default="scope">
                                {{ _L(scope.row.desc) }}
                            </template>
                        </el-table-column>
                        <el-table-column align="left" header-align="center" :label="_L['schema.designer.oper']" width="400">
                            <template #header>
                                <a href="javascript:void(0)" @click="handleFieldNew"
                                    style="text-decoration: underline; color: lightseagreen;">
                                    {{ _L["schema.designer.new"] }}
                                </a>
                            </template>
                            <template #default="scope">
                                <el-button type="info" @click="handleFieldEdit(scope.row, true)">
                                    {{ _L["schema.designer.view"] }}
                                </el-button>
                                <el-button type="success" @click="handleFieldEdit(scope.row, false)">
                                    {{ _L["schema.designer.edit"] }}
                                </el-button>
                                <el-button v-if="scope.$index > 0" type="warning" @click="moveFieldUp(scope.row)">
                                    {{ _L["schema.designer.moveup"] }}
                                </el-button>
                                <el-button type="danger" @click="handleFieldDelete(scope.row)">
                                    {{ _L["schema.designer.delete"] }}
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button v-if="fields.length" type="primary" @click="tryit">{{ _L["schema.designer.tryit"] }}</el-button>
                    <el-button @click="showFieldList = false">{{ _L["schema.designer.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>

        <!-- field editor -->
        <el-drawer v-model="showAppFieldEditor" :title="appFieldOper" direction="rtl" size="100%" destroy-on-close
            append-to-body @closed="closeFieldEditor">
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
                        <el-button @click="showAppFieldEditor = false">{{ _L["schema.designer.close"] }}</el-button>
                    </template>
                    <template v-else>
                        <el-button type="primary" @click="confirmField">{{ _L["schema.designer.save"] }}</el-button>
                        <el-button @click="showAppFieldEditor = false">{{ _L["schema.designer.cancel"] }}</el-button>
                    </template>
                </el-footer>
            </el-container>
        </el-drawer>

        <!-- try it -->
        <el-drawer v-model="showtryit" :title="_L['schema.nav.tryit'] + appTitle" direction="rtl" size="100%"
            destroy-on-close
            append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <tryapp v-if="currApp"
                        :app="currApp"
                    ></tryapp>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button @click="showtryit = false">{{ _L["schema.designer.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>
    </el-container>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { reactive, watch, ref, toRaw } from 'vue'
import { _L, schemaView } from 'schema-node-vueview'
import { _LS, type IAppSchema, type IAppFieldSchema,  getAppSchema, isNull, StructNode, jsonClone, registerAppSchema, removeAppSchema, SchemaLoadState, getAppCachedSchema } from 'schema-node'
import { ElForm } from 'element-plus'
import { appSchemaToJson, clearAllStorageAppSchemas, removeStorageAppSchema, saveAllCustomAppSchemaToStroage, saveStorageAppSchema } from '@/appSchema'
import tryapp from './tryapp.vue'

//#region View

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
            state.app = search.namespace || ""
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

// create
const handleNew = async () => {
    localStorage["schema_new_app"] = state.app

    appNode.value = new StructNode({
        type: "schema.app.app",
    }, {})
    showAppEditor.value = true

    appWatchHandler = appNode.value.subscribe(() => {
        operation.value = _L.value["schema.designer.new"] + " " + (_L.value(appNode.value?.data.display) || appNode.value?.data.name || "")
    }, true)
}

// update
const handleEdit = async (row: any, readonly?: boolean) => {
    localStorage["schema_curr_app"] = row.name

    appNode.value = new StructNode({
        type: "schema.app.app",
        readonly
    }, jsonClone(toRaw(row)))
    showAppEditor.value = true

    if (readonly) {
        operation.value = _L.value["schema.designer.view"] + " " + (_L.value(appNode.value?.data.display) || appNode.value?.data.name || "")
    }
    else {
        appWatchHandler = appNode.value.subscribe(() => {
            operation.value = _L.value["schema.designer.edit"] + " " + (_L.value(appNode.value?.data.display) || appNode.value?.data.name || "")
        }, true)
    }
}

// delete
const handleDelete = (row: any) => {
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
    registerAppSchema([data])
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
    localStorage["schema_curr_app"] = currApp
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
        type: "schema.app.field",
    }, {})
    showAppFieldEditor.value = true

    appFieldWatchHandler = appFieldNode.value.subscribe(() => {
        appFieldOper.value = _L.value["schema.designer.new"] + " " + (_L.value(appFieldNode.value?.data.display) || appFieldNode.value?.data.name || "")
    }, true)
}

// update
const handleFieldEdit = async (row: any, readonly?: boolean) => {
    appFieldNode.value = new StructNode({
        type: "schema.app.field",
        readonly
    }, jsonClone(toRaw(row)))
    showAppFieldEditor.value = true

    if (readonly) {
        appFieldOper.value = _L.value["schema.designer.view"] + " " + (_L.value(appFieldNode.value?.data.display) || appFieldNode.value?.data.name || "")
    }
    else {
        appFieldWatchHandler = appFieldNode.value.subscribe(() => {
            appFieldOper.value = _L.value["schema.designer.edit"] + " " + (_L.value(appFieldNode.value?.data.display) || appFieldNode.value?.data.name || "")
        }, true)
    }
}

// delete
const handleFieldDelete = async (row: any) => {
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema?.fields) return

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
    if (idx! > 0)
    {
        const temp = appSchema.fields[idx - 1]
        appSchema.fields[idx - 1] = appSchema.fields[idx]
        appSchema.fields[idx] = temp
        saveStorageAppSchema(appSchema)
        fields.value = appSchema?.fields ? [...appSchema.fields] : []
    }
}

// save
const confirmField = async () => {
    const res = await fieldEditorRef.value?.validate()
    if (!res || !appFieldNode.value?.valid) return

    if (!appFieldNode.value?.valid) return
    const data = jsonClone(toRaw(appFieldNode.value.data))
    const appSchema = await getAppSchema(currApp!)
    if (!appSchema) return

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