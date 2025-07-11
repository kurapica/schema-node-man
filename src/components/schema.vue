<template>
    <el-container class="main">
        <el-header style="height: fit-content; width: 100%;">
            <el-form :model="state" style="display: flex;" hide-required-asterisk inline>
                <schema-view v-model="state.namespace" in-form :config="{
                    type: 'schema.namespace',
                    display: _L['schema.namespace']
                }"></schema-view>
                <schema-view v-model="state.type" in-form :config="{
                    type: 'schema.schematype',
                    display: _L['schema.schematype']
                }"></schema-view>
                <schema-view v-model="state.keyword" in-form :config="{
                    type: 'system.string',
                    display: _L['schema.designer.keyword']
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
            <el-table :data="schemas" style="width: 100%; height: 70vh;" :border="true"
             header-align="left" 
             :header-cell-style="{ background: '#eee' }"
             @selection-change="handleSelection">
                <el-table-column v-if="downloading" type="selection" width="55"></el-table-column>
                <el-table-column align="left" prop="name" :label="_L['schema.designer.name']" min-width="120" />
                <el-table-column align="left" prop="desc" :label="_L['schema.designer.desc']" min-width="150" />
                <el-table-column align="center" prop="type" :label="_L['schema.designer.type']" width="150">
                    <template #default="scope">
                        {{ _L['schema.schematype.' + scope.row.type] }}
                    </template>
                </el-table-column>
                <el-table-column align="left" header-align="center" :label="_L['schema.designer.oper']" width="280">
                    <template #header>
                        <a href="javascript:void(0)" v-if="state.namespace" @click="goback"
                            style="text-decoration: underline; color: lightseagreen;">
                            {{ _L["schema.designer.return"] }}
                        </a>
                        <span v-else>{{ _L["schema.designer.oper"] }}</span>
                    </template>
                    <template #default="scope">
                        <el-button v-if="scope.row.type === SchemaType.Namespace"
                            type="info" @click="choose(scope.row)">{{ _L["schema.designer.down"] }}</el-button>
                        <el-button v-else type="info" @click="handleEdit(scope.row, true)">
                            {{ _L["schema.designer.view"] }}
                        </el-button>
                        <el-button type="info" v-if="!((scope.row.loadState || 0) & SchemaLoadState.System)" @click="handleEdit(scope.row, false)">
                            {{ _L["schema.designer.edit"] }}
                        </el-button>
                        <el-button v-if="isSchemaDeletable(scope.row.name)" type="danger" @click="handleDelete(scope.row)">
                            {{ _L["schema.designer.delete"] }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-footer>
            <el-button type="danger" @click="clearAllStorageSchemas" style="position: absolute;right: 3rem;">{{ _L["schema.designer.clearcustomschemas"] }}</el-button>
        </el-footer>

        <!-- namespace editor -->
        <el-drawer v-model="showNamespaceEditor" :title="operation" direction="rtl" size="100%" destroy-on-close
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
                        <el-button v-if="tryitTypes.includes(namespaceNode.rawData.type)" type="primary" @click="tryit">{{ _L["schema.designer.tryit"] }}</el-button>
                        <el-button @click="showNamespaceEditor = false">{{ _L["schema.designer.close"] }}</el-button>
                    </template>
                    <template v-else>
                        <el-button type="primary" @click="confirmNameSpace">{{ _L["schema.designer.save"] }}</el-button>
                        <el-button @click="showNamespaceEditor = false">{{ _L["schema.designer.cancel"] }}</el-button>
                    </template>
                </el-footer>
            </el-container>
        </el-drawer>

        <!-- try it -->
        <el-drawer v-model="showtryit" :title="_L['schema.nav.tryit'] + (namespaceNode?.data.desc || namespaceNode?.data.name)" direction="rtl" size="100%"
            destroy-on-close
            append-to-body>
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <tryit-view
                        :type="tryittype"
                    ></tryit-view>
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
import { reactive, watch, ref, toRaw } from 'vue'
import schemaView from 'schema-node-vue-view'
import tryitView from './tryit.vue'
import { _L } from 'schema-node-vue-view'
import { deepClone, getSchema, type INodeSchema, isSchemaDeletable, registerSchema, SchemaType, StructNode, removeSchema, isNull, SchemaLoadState, getCachedSchema, jsonClone } from 'schema-node'
import { ElForm, ElMessage } from 'element-plus'
import { clearAllStorageSchemas, removeStorageSchema, saveAllCustomSchemaToStroage, saveStorageSchema } from '@/schema'
import { getSchemaServerProvider } from '@/schemaServerProvider'

const schemas = ref<INodeSchema[]>([])
const schemaTypeOrder = {
    [SchemaType.Namespace]: 1,
    [SchemaType.Scalar]: 2,
    [SchemaType.Enum]: 3,
    [SchemaType.Struct]: 4,
    [SchemaType.Array]: 5,
    [SchemaType.Function]: 6
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
        if (state.type) {
            temp = temp.filter(p => p.type === state.type)
        }
        if (state.keyword) {
            temp = temp.filter(p => p.name.match(state.keyword) || p.desc && `${p.desc}`.match(state.keyword))
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

let namesapceWatchHandler: Function | null = null

// create
const handleNew = async () => {
    localStorage["schema_new_namespace"] = state.namespace

    namespaceNode.value = new StructNode({
        type: "schema.namespacedefine",
    }, {})
    showNamespaceEditor.value = true

    namesapceWatchHandler = namespaceNode.value.subscribe(() => {
        operation.value = _L.value["schema.designer.new"] + " " + (namespaceNode.value?.data.desc || namespaceNode.value?.data.name || "")
    }, true)
}

// update
const handleEdit = async (row: any, readonly?: boolean) => {
    namespaceNode.value = new StructNode({
        type: "schema.namespacedefine",
        readonly
    }, jsonClone(toRaw(row)))
    showNamespaceEditor.value = true

    if (readonly) {
        operation.value = _L.value["schema.designer.view"] + " " + (namespaceNode.value?.data.desc || namespaceNode.value?.data.name || "")
    }
    else {
        namesapceWatchHandler = namespaceNode.value.subscribe(() => {
            operation.value = _L.value["schema.designer.edit"] + " " + (namespaceNode.value?.data.desc || namespaceNode.value?.data.name || "")
        }, true)
    }
}

// delete
const handleDelete = async (row: any) => {
    if (!isSchemaDeletable(row.name))
    {
        ElMessage.error(_L.value["schema.designer.cantdelschema"])
        return
    }
    if ((row.loadState || 0) && SchemaLoadState.Server)
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            const res = await provider.deleteSchema(row.name)
            if (!res.result)
            {
                ElMessage.error(res.message || _L.value["schema.designer.error"])
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
    await editorRef.value?.validate()

    if (!namespaceNode.value?.valid) return
    const data = jsonClone(toRaw(namespaceNode.value.data))
    const schema = getCachedSchema(data.name)
    
    if (!schema || ((schema.loadState || 0) & SchemaLoadState.Server))
    {
        const provider = getSchemaServerProvider()
        if (provider)
        {
            const res = await provider.saveSchema(data)
            if (!res.result)
            {
                ElMessage.error(res.message || _L.value["schema.designer.error"])
                return
            }
            data.loadState = SchemaLoadState.Server
        }
    }

    registerSchema([data])
    saveStorageSchema(data)
    showNamespaceEditor.value = false
    return refresh()
}

// close
const closeNamespaceEditor = () => {
    if (namesapceWatchHandler) namesapceWatchHandler()
    namespaceNode.value?.dispose()
    namespaceNode.value = undefined
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

const schemaToJson = (schema: INodeSchema | undefined): INodeSchema =>
{
    return schema ? {
        name: schema.name,
        type: schema.type,
        desc: `${schema.desc || ""}`,
        scalar: schema.scalar,
        enum: schema.enum,
        struct: schema.struct,
        array: schema.array,
        func: schema.func ? { ...schema.func, func: undefined } : undefined,
        schemas: schema.schemas?.filter(f => f.type === SchemaType.Namespace || !((f.loadState || 0) & SchemaLoadState.System)).map(schemaToJson).filter(f => f.type !== SchemaType.Namespace || f.schemas?.length)
    } : {} as any
}

const download = () => {
    if (!selections.length) return
    const name = selections.length > 1 ? "schema.json" : `${selections[0]}.json` 
    const content = JSON.stringify(selections.map(getCachedSchema).map(schemaToJson).filter(f => f.type !== SchemaType.Namespace || f.schemas?.length), null, 2)

    // download
    const blob = new Blob([content], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
</style>