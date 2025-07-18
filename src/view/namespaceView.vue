<template>
    <section style="width: 100%;">
        <template v-if="state.readonly && plainText">
            <el-popover
                placement="bottom-start"
                :title="state.data"
                width="width:fit-content"
                trigger="hover">
                <namespace-info-view :type="state.data"/>
                <template #reference>
                    <a :style="{'width': '100%', 'color': 'green', 'text-align': plainText === true ? 'center' : plainText }"
                        href="javascript:void(0)"
                        @click="handleEdit(state.data, true)">
                        {{ state.display }}
                    </a>
                </template>
            </el-popover>
        </template>
        <el-cascader v-else
            v-model="data" 
            style="width: 100%" 
            :options="root.children" 
            :props="{
                emitPath: false,
                checkStrictly: namespaceMap.length === 1,
                lazy: true,
                lazyLoad: lazyLoad
            }" 
            :placeholder="getSelectPlaceHolder(scalarNode)"
            :disabled="state.readonly || state.disable" :clearable="!state.require"
            v-bind="$attrs">
            <template #default="{ data }">
                <template v-if="namespaceMap.length === 1 || data.type === SchemaType.Namespace">
                    <span>{{ data.label }}</span>
                </template>
                <template v-else>
                    <el-popover
                        placement="right-start"
                        :title="data.value"
                        width="width:fit-content"
                        :open-delay="500"
                        trigger="hover">
                        <el-button v-if="!(data.loadState & SchemaLoadState.System)" type="warning" @click="handleEdit(data.value, true)" style="float: right">{{ _L["schema.designer.view"] }}</el-button>
                        <namespace-info-view style="min-width: 300px;" :type="data.value"/>
                        <template #reference>
                            <span style="width: 100%; display: inline-block;">{{ data.label }}</span>
                        </template>
                    </el-popover>
                </template>
            </template>
        </el-cascader>

        <!-- namespace editor -->
        <el-drawer v-model="showNamespaceEditor" :title="operation" direction="rtl" size="100%" destroy-on-close
            append-to-body @closed="closeNamespaceEditor">
            <el-container class="main" style="height: 80vh;color:black">
                <el-header>
                    <el-button v-if="editable" type="warning" @click="handleEdit(handletype, false)" style="float: right">{{ _L["schema.designer.edit"] }}</el-button>
                </el-header>
                <el-main>
                    <el-form v-if="namespaceNode" ref="editorRef" :model="namespaceNode.rawData" label-width="160"
                        label-position="left" style="width: 100%; height: 90%;">
                        <div class="draw-view">
                            <schema-view
                                :key="namespaceNode.guid"
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
                        <el-button @click="showNamespaceEditor = false">{{ _L["schema.designer.close"] }}</el-button>
                    </template>
                    <template v-else>
                        <el-button type="primary" @click="confirmNameSpace">{{ _L["schema.designer.save"] }}</el-button>
                        <el-button @click="showNamespaceEditor = false">{{ _L["schema.designer.cancel"] }}</el-button>
                    </template>
                </el-footer>
            </el-container>
        </el-drawer>
    </section>
</template>

<script lang="ts" setup>
import { saveStorageSchema } from "@/schema"
import { getSchemaServerProvider } from "@/schemaServerProvider"
import { ElForm, ElMessage } from "element-plus"
import { ExpressionType, getCachedSchema, getSchema, isSchemaCanBeUseAs, jsonClone, registerSchema, SchemaLoadState, SchemaType, StructNode, subscribeLanguage, type INodeSchema, type ScalarNode, type SchemaTypeValue } from "schema-node"
import { _L, getSelectPlaceHolder } from "schema-node-vue-view"
import { computed, onMounted, onUnmounted, reactive, ref, toRaw } from "vue"
import namespaceInfoView from "./namespaceInfoView.vue"
import schemaView from "schema-node-vue-view"

//#region Inner type
interface ICascaderOptionInfo {
    value: string
    type: SchemaTypeValue
    label: string
    leaf: boolean
    loadState: number
    children: ICascaderOptionInfo[] | null
}
//#endregion

const props = defineProps<{ node: ScalarNode, plainText?: any, disabled?: boolean }>()
const scalarNode = toRaw(props.node)
const type = scalarNode.config.type

// display state
const state = reactive<{
    data?: any,
    display?: any,
    disable?: boolean,
    require?: boolean,
    readonly?: boolean,
}>({})

// Data
const data = computed({
    get (): any {
        return state.data
    },
    set(value: any) {
        scalarNode.data = value
    }
})

const schemaTypeOrder = {
    [SchemaType.Namespace]: 1,
    [SchemaType.Scalar]: 2,
    [SchemaType.Enum]: 3,
    [SchemaType.Struct]: 4,
    [SchemaType.Array]: 5,
    [SchemaType.Function]: 6
}

// cascader root
const root = reactive<ICascaderOptionInfo>({
    value: "",
    type: SchemaType.Namespace,
    label: "",
    leaf: false,
    loadState: 0,
    children: null
})
let compatibleType = "" // 兼容类型
let upLimit = 99
let lowLimit = 0

// namespace map
const namespaceMap: any = {
    "schema.namespace": [SchemaType.Namespace],
    "schema.scalartype": [SchemaType.Namespace, SchemaType.Scalar],
    "schema.enumtype": [SchemaType.Namespace, SchemaType.Enum],
    "schema.structtype": [SchemaType.Namespace, SchemaType.Struct],
    "schema.arraytype": [SchemaType.Namespace, SchemaType.Array],
    "schema.functype": [SchemaType.Namespace, SchemaType.Function],
    "schema.scalarenumtype": [SchemaType.Namespace, SchemaType.Scalar, SchemaType.Enum],
    "schema.arrayeletype": [SchemaType.Namespace, SchemaType.Scalar, SchemaType.Enum, SchemaType.Struct],
    "schema.valuetype": [SchemaType.Namespace, SchemaType.Scalar, SchemaType.Enum, SchemaType.Struct, SchemaType.Array],
}[type as string]

// view

//#region Schema Edit
const editorRef = ref<InstanceType<typeof ElForm>>()
const showNamespaceEditor = ref(false)
const namespaceNode = ref<StructNode | undefined>(undefined)
const operation = ref("")
const handletype = ref("")
const editable = ref(false)

let namesapceWatchHandler: Function | null = null

// update
const handleEdit = async (name: string, readonly?: boolean) => {
    const schema = await getSchema(name)
    handletype.value = name
    editable.value = (readonly || false) && ((schema?.loadState || 0) & SchemaLoadState.System) === 0
    namespaceNode.value = new StructNode({
        type: "schema.namespacedefine",
        readonly
    }, jsonClone(schema))
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
}

// close
const closeNamespaceEditor = () => {
    if (namesapceWatchHandler) namesapceWatchHandler()
    namespaceNode.value?.dispose()
    namespaceNode.value = undefined
}
//#endregion

// generate
const genBlackList = async (options: ICascaderOptionInfo[]): Promise<string[]> => {
    // check compatible type
    if (namespaceMap.includes(SchemaType.Function)) {
        const funcList = options.filter(r => r.type === SchemaType.Function)
        const blackList: string[] = []
        for(let i = 0; i < funcList.length; i++)
        {
            const f = await getSchema(funcList[i].value)
            if (f?.type !== SchemaType.Function || !f.func) continue
            if (compatibleType && !/^[tT]\d*$/.test(f.func.return) && !await isSchemaCanBeUseAs(f.func.return, compatibleType)) {
                blackList.push(f.name)
            }
            else if(f.func.args.length < lowLimit || f.func.args.length > upLimit)
            {
                blackList.push(f.name)
            }
        }
        return blackList
    }
    else {
        return []
    }
}

const buildOptions = async (options: ICascaderOptionInfo[], values: INodeSchema[]) => {
    const nsOnly = namespaceMap.length === 1

    values = values?.filter(v => namespaceMap.includes(v.type)) || []

    // sort
    values.sort((a, b) => {
        if (schemaTypeOrder[a.type] < schemaTypeOrder[b.type]) return -1
        if (schemaTypeOrder[a.type] < schemaTypeOrder[b.type]) return 1
        return a.name < b.name ? -1 : 1
    })

    // generate
    const result: ICascaderOptionInfo[] = []
    for (let i = 0; i < values.length; i++) {
        const v = values[i]
        const ele: ICascaderOptionInfo = {
            value: v.name,
            type: v.type,
            label: `${v.desc || v.name}`,
            loadState: v.loadState || 0,
            leaf: v.type !== SchemaType.Namespace || (nsOnly && (!v.schemas?.length || v.schemas.findIndex(s => s.type === SchemaType.Namespace) < 0)),
            children: null
        }
        if (!ele.leaf && v.schemas && scalarNode.data && `${scalarNode.data}`.startsWith(v.name)) {
            ele.children = []
            await buildOptions(ele.children, v.schemas)
        }
        result.push(ele)
    }

    const blackList = await genBlackList(result)
    options.splice(0, options.length, ...result.filter(r => !blackList.includes(r.value)))

    return options
}

const lazyLoad = (node: ICascaderOptionInfo, resolve: any, reject: any) => {
    try {
        const { value } = node
        if (!value) return resolve([])

        const paths = value.toLowerCase().split(".")
        let ns = root
        for (let i = 0; i < paths.length; i++) {
            const name = paths.slice(0, i + 1).join(".")
            ns = ns.children!.find(c => c.value.toLowerCase() === name)!
        }

        getSchema(value)
        .then(res => {
            buildOptions([], res?.schemas || []).then(r => {
                ns.children = r
                resolve(ns.children)
            })
            .catch(ex => reject && reject(ex))
        })
        .catch(ex => reject && reject(ex))
    }
    catch (ex) {
        return reject && reject(ex)
    }
}

const reBuildOptions = async () => {
    const enumRoot = scalarNode.rule?.root
    if (enumRoot) {
        const rootType = await getSchema(enumRoot)
        if (!rootType) {
            root.value = ""
            compatibleType = ""
        }
        else if (rootType.type === SchemaType.Namespace) {
            root.value = enumRoot
            compatibleType = ""
        }
        else {
            root.value = ""
            compatibleType = "" + enumRoot
        }
    }
    else {
        compatibleType = ""
        root.value = ""
    }

    root.children = await buildOptions([], (await getSchema(root.value))?.schemas || [])
}

// change handler
let dataWatcher: Function | null = null
let stateHandler: Function | null = null
let langHandler: Function | null = null
let exptypeHandler: Function | null = null

onMounted(() => {
    const parent = scalarNode.parent
    if (scalarNode.config.type === "schema.functype" && parent?.config.type === "schema.funcexp")
    {
        const expNode = (parent as StructNode).getField("type") as ScalarNode
        exptypeHandler = expNode.subscribe(() => {
            if (expNode.rawData === ExpressionType.Reduce)
            {
                upLimit = 2
                lowLimit = 2
            }
            else
            {
                upLimit = 99
                lowLimit = 0
            }
            reBuildOptions()
        }, true)
    }

    dataWatcher = scalarNode.subscribe(async() =>  {
        const data = scalarNode.rawData
        state.data = data
        
        const paths = (data || "").split(".")
        const display: string[] = []
        let option = root
        let rebuild = false
        for (let i = 0; i < paths.length; i++) {
            const name = paths.slice(0, i + 1).join(".")
            const match = option?.children?.find(c => c.value === name)
            if (match)
            {
                display.push(match.label)
                option = match
            }
            else
            {
                rebuild = true
                const schema = await getSchema(name)
                if (!schema) break
                display.push(`${schema.desc || paths[i]}`)
            }
        }
        state.display = display.join("/")
        if (rebuild)
            await reBuildOptions()
    }, true)

    stateHandler = scalarNode.subscribeState(() => {
        state.disable = scalarNode.rule.disable
        state.require = scalarNode.require
        state.readonly = scalarNode.readonly

        const r = scalarNode.rule.root || null
        if (r !== compatibleType)
        {
            compatibleType = r
            reBuildOptions()
        }
    }, true)

    // update display
    langHandler = subscribeLanguage(reBuildOptions)
})

onUnmounted(() => {
    if (dataWatcher) dataWatcher()
    if (stateHandler) stateHandler()
    if (langHandler) langHandler()
    if (exptypeHandler) exptypeHandler()
})
</script>