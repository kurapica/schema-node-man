<template>
    <el-container class="main">
        <el-header style="height: fit-content; width: 100%;">
            <el-form :model="state" style="display: flex;" hide-required-asterisk inline>
                <schema-view v-model="state.namespace" in-form :config="{
                    type: 'system.schema.namespace',
                    display: _LS('system.schema.namespace')
                }"></schema-view>
                <schema-view v-model="state.type" in-form :config="{
                    type: 'system.schema.schematype',
                    display: _LS('system.schema.schematype')
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
            <el-table :data="schemas" style="width: 100%; height: 70vh;" :border="true"
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
                <el-table-column align="center" prop="type" :label="_L['frontend.view.type']" width="150">
                    <template #default="scope">
                        {{ _L['system.schema.schematype.' + scope.row.type] }}
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
                        <el-button v-if="scope.row.type === SchemaType.Namespace"
                            :type="(scope.row.hasSchemas || scope.row.schemas?.length) ? 'success' : 'info'" @click="choose(scope.row)">{{ _L["frontend.view.down"] }}
                        </el-button>
                        <el-button v-else type="success" @click="handleEdit(scope.row, true)">
                            {{ _L["frontend.view.view"] }}
                        </el-button>
                        <el-button type="warning" v-if="!((scope.row.loadState || 0) & SchemaLoadState.System) || scope.row.type === SchemaType.Namespace" @click="handleEdit(scope.row, false)">
                            {{ _L["frontend.view.edit"] }}
                        </el-button>
                        <el-popconfirm
                            v-if="isSchemaDeletable(scope.row.name)" 
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
            <el-button type="danger" @click="clearAllStorageSchemas" style="position: absolute;right: 3rem;">{{ _L["frontend.view.clearcustomschemas"] }}</el-button>
        </el-footer>

        <!-- namespace editor -->
        <el-drawer v-model="showNamespaceEditor" :title="operation" direction="rtl" size="100%"
            append-to-body @closed="closeNamespaceEditor">
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <el-form v-if="namespaceNode" ref="editorRef" :model="namespaceNode.rawData" label-width="160"
                        label-position="left" style="width: 100%; height: 90%;">
                        <div class="draw-view">
                            <schema-view
                                :node="(namespaceNode as StructNode)"
                                in-form="expandall"
                                plain-text="left"
                            ></schema-view>
                        </div>
                    </el-form>
                </el-main>
                <el-footer>
                    <br/>
                    <template v-if="namespaceNode?.readonly">
                        <el-button v-if="tryitTypes.includes(namespaceNode.rawData.type)" type="primary" @click="tryit">{{ _L["frontend.view.tryit"] }}</el-button>
                        <el-button @click="showNamespaceEditor = false">{{ _L["frontend.view.close"] }}</el-button>
                        <el-button v-if="currRow?.usedBy?.length || currRow?.usedByApp?.length" @click="showViewRef = true" style="float:right" type="info" >{{ _L["frontend.view.viewref"] }}</el-button>
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
        <el-drawer v-model="showtryit" :title="_L['frontend.nav.tryit'] + ' - ' + (_L(namespaceNode?.data.display) || namespaceNode?.data.name)" direction="rtl" size="100%" append-to-body destroy-on-close>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <tryit-view :type="tryittype"></tryit-view>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button @click="showtryit = false">{{ _L["frontend.view.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>

        <!-- View ref -->
        <el-drawer v-model="showViewRef" :title="_L['frontend.view.viewref']" direction="rtl" size="40%" append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <template v-if="currRow?.usedBy?.length">
                        <h3>{{ _L["system.schema.schematype"] }}</h3>
                        <hr/>
                        <ul>
                            <li v-for="type in currRow?.usedBy" :key="type">
                                <schema-view :config="{
                                    type: 'system.schema.anytype',
                                    readonly: true
                                }" :value="type" plain-text="left"></schema-view>
                            </li>
                        </ul>
                        <br/>
                    </template>

                    <template v-if="currRow?.usedByApp?.length">
                        <h3>{{ _L["frontend.apptarget.app"] }}</h3>
                        <hr/>
                        <ul>
                            <li v-for="app in currRow?.usedByApp" :key="app">
                                <schema-view :config="{
                                    type: 'system.schema.app',
                                    readonly: true
                                }" :value="app" plain-text="left"></schema-view>
                            </li>
                        </ul>
                    </template>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button @click="showViewRef = false">{{ _L["frontend.view.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>
    </el-container>
</template>

<script setup lang="ts">
import { reactive, watch, ref, toRaw } from 'vue'
import { _L, schemaView } from 'schema-node-vueview'
import { _LS, getSchema, type INodeSchema, SchemaNodeStatus, isSchemaDeletable, registerSchema, SchemaType, StructNode, removeSchema, isNull, SchemaLoadState, getCachedSchema, jsonClone, EnumNode } from 'schema-node'
import { ElForm, ElMessage } from 'element-plus'
import { clearAllStorageSchemas, removeStorageSchema, saveAllCustomSchemaToStroage, saveStorageSchema, schemaToJson } from '../schema'
import { getSchemaServerProvider } from '../schemaServerProvider'
import tryitView from './tryit.vue'
import { Delete } from '@element-plus/icons-vue'

const schemas = ref<INodeSchema[]>([])
const schemaTypeOrder = {
    [SchemaType.Namespace]: 1,
    [SchemaType.Scalar]: 2,
    [SchemaType.Enum]: 3,
    [SchemaType.Struct]: 4,
    [SchemaType.Array]: 5,
    [SchemaType.Func]: 6,
    [SchemaType.Json]: 7,
    [SchemaType.Event]: 8,
    [SchemaType.Workflow]: 9,
    [SchemaType.Policy]: 10
}

const tryitTypes = [ SchemaType.Struct, SchemaType.Array ]

const state = reactive({
    namespace: "",
    type: null,
    keyword: ""
})

if (localStorage["schema_man_search"])
{
    try
    {
        const search = JSON.parse(localStorage["schema_man_search"])
        if (search && typeof(search) === "object")
        {
            state.namespace = search.namespace || ""
            state.type = search.type || null
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
    else if(!isNull(state.type))
    {
        state.type = null
    }
    else
    {
        state.namespace = ""
    }
}

const goback = () => {
    const paths = state.namespace.split(".")
    state.namespace = paths.slice(0, paths.length - 1).join(".")
}

const choose = (schema: INodeSchema) => {
    state.namespace = schema.name
}

const refresh = async () => {
    localStorage["schema_man_search"] = JSON.stringify(state)
    const schema = await getSchema(state.namespace || "")
    if (schema?.type === SchemaType.Namespace) {
        let temp = [...schema.schemas || []]
        temp = temp.filter(p => ((p.loadState || 0) & SchemaLoadState.Frontend) === 0) // hide frontend only schemas
        if (state.type) {
            temp = temp.filter(p => p.type === state.type)
        }
        if (state.keyword) {
            temp = temp.filter(p => p.name.match(state.keyword) || p.display && `${p.display}`.match(state.keyword))
        }
        temp.sort((a, b) => {
            if (schemaTypeOrder[a.type] < schemaTypeOrder[b.type]) return -1
            if (schemaTypeOrder[a.type] < schemaTypeOrder[b.type]) return 1
            return a.name < b.name ? -1 : 1
        })
        schemas.value = temp
    }
}

watch(state, refresh, { immediate: true })

//#region Schema Edit

const editorRef = ref<InstanceType<typeof ElForm>>()
const showNamespaceEditor = ref(false)
const namespaceNode = ref<StructNode | undefined>(undefined)
const operation = ref("")
const showViewRef = ref(false)

let namesapceWatchHandler: Function | null = null

// create
const handleNew = async () => {
    localStorage["schema_new_namespace"] = state.namespace

    namespaceNode.value = new StructNode({
        type: "system.schema.nodeschema",
    }, {})
    const typeField = namespaceNode.value.getField("type") as EnumNode
    typeField.rule.blackList = [ SchemaType.Json, SchemaType.Event, SchemaType.Workflow]
    showNamespaceEditor.value = true

    namesapceWatchHandler = namespaceNode.value.subscribe(() => {
        operation.value = _L.value["frontend.view.new"] + " " + (_L.value(namespaceNode.value?.data.display) || namespaceNode.value?.data.name || "")
    }, true)
}

// update
const currRow = ref<INodeSchema | null>(null)
const handleEdit = async (row: any, readonly?: boolean) => {
    currRow.value = row
    const schema = await getSchema(row.name)

    namespaceNode.value = new StructNode({
        type: "system.schema.nodeschema",
        readonly
    }, jsonClone(schema))
    showNamespaceEditor.value = true

    if (readonly) {
        operation.value = _L.value["frontend.view.view"] + " " + (_L.value(namespaceNode.value?.data.display) || namespaceNode.value?.data.name || "")
    }
    else {
        namesapceWatchHandler = namespaceNode.value.subscribe(() => {
            operation.value = _L.value["frontend.view.edit"] + " " + (_L.value(namespaceNode.value?.data.display) || namespaceNode.value?.data.name || "")
        }, true)
    }
}

// delete
const handleDelete = async (row: any) => {
    if (!isSchemaDeletable(row.name))
    {
        ElMessage.error(_L.value["frontend.view.cantdelschema"])
        return
    }
    if ((row.loadState || 0) & SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            try
            {
                const res = await provider.deleteSchema(row.name)
                if (!res)
                {
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
    removeStorageSchema(row.name)
    removeSchema(row.name)
    return refresh()
}

// save
const confirmNameSpace = async () => {
    const res = await editorRef.value?.validate()
    if (!res || !namespaceNode.value?.valid) return

    if (!namespaceNode.value?.valid) return
    const data = schemaToJson(jsonClone(toRaw(namespaceNode.value.data)))
    const schema = getCachedSchema(data.name)
    
    if (!schema || ((schema.loadState || 0) & SchemaLoadState.Server))
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            try
            {
                const res = await provider.saveSchema(data)
                if (!res)
                {
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

    registerSchema([data], data.loadState)
    saveStorageSchema(data)
    closeNamespaceEditor()
    showNamespaceEditor.value = false
    return refresh()
}

// close
const closeNamespaceEditor = () => {
    if (namesapceWatchHandler) namesapceWatchHandler()
    namespaceNode.value?.dispose()
    namespaceNode.value = undefined
    namesapceWatchHandler = null
    currRow.value = null
}

//#endregion

//#region Try it

const showtryit = ref(false)
const tryittype = ref("")

const tryit = () => {
    tryittype.value = namespaceNode.value?.rawData.name
    showtryit.value = true
}

//#endregion

//#region Copy Schema

const copySchema = async () => {
    const schema = jsonClone(namespaceNode.value?.rawData)
    if (!schema) return
    
    closeNamespaceEditor()
    showNamespaceEditor.value = false
    await new Promise(resolve => setTimeout(resolve, 200)) // wait drawer close animation

    const name = `${schema.name}_copy`
    schema.name = ""
    localStorage["schema_new_namespace"] = state.namespace

    namespaceNode.value = new StructNode({
        type: "system.schema.nodeschema",
    }, jsonClone(schema))

    namespaceNode.value.getField("name")!.data = name

    if (namesapceWatchHandler) namesapceWatchHandler()
    namesapceWatchHandler = namespaceNode.value.subscribe(() => {
        operation.value = _L.value["frontend.view.new"] + " " + (_L.value(namespaceNode.value?.data.display) || namespaceNode.value?.data.name || "")
    }, true)
    showNamespaceEditor.value = true
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
    const content = JSON.stringify(selections.map(getCachedSchema).map(s => schemaToJson(s!)).filter(f => f.type !== SchemaType.Namespace || f.schemas?.length), null, 2)

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
            registerSchema(data, SchemaLoadState.Custom)
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
    color: black;
}
.el-form-item .el-form-item {
    margin-bottom: 18px;
}
</style>