<template>
    <section style="width: 100%;">
        <el-popover v-if="!expanded"
            placement="bottom-start"
            :title="state.data"
            width="width:fit-content"
            trigger="hover">
            <namespace-info-view :type="state.data"/>
            <template #reference>
                <a :style="{'width': '100%', 'color': 'green', 'text-align': plainText === true ? 'center' : plainText }"
                    href="javascript:void(0)"
                    @click="handleEdit(state.data, true)">
                    {{ state.display || _L["frontend.view.selectnamespace"] }}
                </a>
            </template>
        </el-popover>
        <section v-else style="display: flex;">
            <el-cascader
                v-model="data" 
                :style="{width: `${state.generic?.length ? Math.floor(100 / (state.generic.length + 1)) : 100}%`}" 
                :options="root.children" 
                :props="{
                    emitPath: false,
                    checkStrictly: namespaceMap.length === 1,
                    lazy: true,
                    lazyLoad: lazyLoad
                }" 
                :placeholder="scalarNode.selectPlaceHolder"
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
                            :offset="42"
                            trigger="hover">
                            <el-button v-if="!(data.loadState & SchemaLoadState.System)" type="warning" @click="handleEdit(data.value, true)" style="float: right">{{ _L["frontend.view.view"] }}</el-button>
                            <namespace-info-view style="min-width: 300px;" :type="data.value"/>
                            <template #reference>
                                <span style="width: 100%; display: inline-block;">{{ data.label }}</span>
                            </template>
                        </el-popover>
                    </template>
                </template>
            </el-cascader>
            <template v-if="state.generic?.length" >
                <span>&lt;</span>
                <template v-for="(genNode, index) in state.generic" :key="genNode.guid">
                    <schema-view
                        :node="genNode as any"
                        :style="{width: `${Math.floor(98 / (state.generic.length))}%`}"
                        no-generic
                        v-bind="$attrs"
                    ></schema-view>
                    <span v-if="index < state.generic.length - 1">,</span>
                </template>
                <span>&gt;</span>
            </template>
        </section>

        <!-- namespace editor -->
        <el-drawer v-model="showNamespaceEditor" :title="operation" direction="rtl" size="100%" append-to-body @closed="closeNamespaceEditor">
            <el-container class="main" style="height: 80vh;color:black">
                <el-header>
                    <el-button v-if="editable" type="warning" @click="handleEdit(handletype, false)" style="float: right">{{ _L["frontend.view.edit"] }}</el-button>
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
                        <el-button @click="showNamespaceEditor = false">{{ _L["frontend.view.close"] }}</el-button>
                    </template>
                    <template v-else>
                        <el-button type="primary" @click="confirmNameSpace">{{ _L["frontend.view.save"] }}</el-button>
                        <el-button @click="showNamespaceEditor = false">{{ _L["frontend.view.cancel"] }}</el-button>
                    </template>
                </el-footer>
            </el-container>
        </el-drawer>
    </section>
</template>

<script lang="ts" setup>
import { saveStorageSchema } from "../schema"
import { getSchemaServerProvider } from "../schemaServerProvider"
import { ElForm, ElMessage } from "element-plus"
import { ExpressionType, getArraySchema, getCachedSchema, getGenericParameter, getSchema, isNull, isSchemaCanBeUseAs, jsonClone, NS_SYSTEM_ENTRIES, REGEX_GENERIC_IMPLEMENT, registerSchema, RelationType, ScalarNode, SchemaLoadState, SchemaType, StructNode, subscribeLanguage, type ILocaleString, type INodeSchema, type SchemaTypeValue, getAppSchema, _LS, debounce } from "schema-node"
import { _L, schemaView } from "schema-node-vueview"
import { computed, onMounted, onUnmounted, reactive, ref, toRaw } from "vue"
import namespaceInfoView from "./namespaceInfoView.vue"

//#region Inner type
interface ICascaderOptionInfo {
    value: string
    type: SchemaTypeValue
    display?: ILocaleString
    label: string
    leaf: boolean
    loadState: number
    children: ICascaderOptionInfo[] | null
}
//#endregion

const props = defineProps<{ node: ScalarNode, plainText?: any, disabled?: boolean, noGeneric?: boolean, expand?: boolean }>()
const scalarNode = toRaw(props.node)
const type = scalarNode.config.type

// display state
const state = reactive<{
    data?: any,
    display?: any,
    disable?: boolean,
    require?: boolean,
    readonly?: boolean,
    generic?: ScalarNode[]
}>({ 
    disable: scalarNode.rule.disable,
    require: scalarNode.require,
    readonly: scalarNode.readonly 
})
const expanded = ref(props.expand || false)

const setData = (value: any) => {
    if (state.generic?.length)
    {
        value = state.generic.findIndex(g => g.data) >= 0 ? `${value}<${state.generic.map(g => g.data || "").join(", ")}>` : value
    }
    scalarNode.data = value
}

// Data
const data = computed({
    get (): any {
        return state.data
    },
    set(value: any) {
        setData(value)
    }
})

const schemaTypeOrder = {
    [SchemaType.Namespace]: 1,
    [SchemaType.Scalar]: 2,
    [SchemaType.Enum]: 3,
    [SchemaType.Struct]: 4,
    [SchemaType.Array]: 5,
    [SchemaType.Func]: 6,
    [SchemaType.Event]: 7,
    [SchemaType.Workflow]: 8,
    [SchemaType.Policy]: 9,
    [SchemaType.Json]: 10
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
let compatibleType = ""
let otherCompatibleType = ""
let upLimit = 99
let lowLimit = 0
let rowAccessType = ""

// namespace map
const namespaceMap: any = {
    "system.schema.anytype": [SchemaType.Namespace, SchemaType.Scalar, SchemaType.Enum, SchemaType.Struct, SchemaType.Array, SchemaType.Func],
    "system.schema.namespace": [SchemaType.Namespace],
    "system.schema.scalartype": [SchemaType.Namespace, SchemaType.Scalar],
    "system.schema.enumtype": [SchemaType.Namespace, SchemaType.Enum],
    "system.schema.structtype": [SchemaType.Namespace, SchemaType.Struct],
    "system.schema.arraytype": [SchemaType.Namespace, SchemaType.Array],
    "system.schema.functype": [SchemaType.Namespace, SchemaType.Func],
    "system.schema.eventtype": [SchemaType.Namespace, SchemaType.Event],
    "system.schema.workflowtype": [SchemaType.Namespace, SchemaType.Workflow],
    "system.schema.policytype": [SchemaType.Namespace, SchemaType.Policy],
    "system.schema.pushfunctype": [SchemaType.Namespace, SchemaType.Func],
    "system.schema.evaluatorfunc": [SchemaType.Namespace, SchemaType.Func],
    "system.schema.predicatefunc": [SchemaType.Namespace, SchemaType.Func],
    "system.schema.validfunc": [SchemaType.Namespace, SchemaType.Func],
    "system.schema.whitelistfunc": [SchemaType.Namespace, SchemaType.Func],
    "system.schema.arrayeletype": [SchemaType.Namespace, SchemaType.Scalar, SchemaType.Enum, SchemaType.Struct],
    "system.schema.valuetype": [SchemaType.Namespace, SchemaType.Scalar, SchemaType.Enum, SchemaType.Struct, SchemaType.Array],
}[type as string]

// Push function allow both value type and array type of the value type
const ispushfunctype = type === "system.schema.pushfunctype"
const isscalarvalidfunc = type === "system.schema.validfunc"
const isscalarwhitelist = type === "system.schema.whitelistfunc"
const enableEntries = ref(false)

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
    if (!state.readonly && !expanded.value) {
        expanded.value = true
        reBuildOptions()
        return
    }

    const schema = await getSchema(name)
    handletype.value = name
    editable.value = (readonly || false) && ((schema?.loadState || 0) & SchemaLoadState.System) === 0
    namespaceNode.value = new StructNode({
        type: "system.schema.nodeschema",
        readonly
    }, jsonClone(schema))
    showNamespaceEditor.value = true

    if (readonly) {
        operation.value = _L.value["frontend.view.view"] + " " + _L.value(namespaceNode.value?.data.display || namespaceNode.value?.data.name || "")
    }
    else {
        namesapceWatchHandler = namespaceNode.value.subscribe(() => {
            operation.value = _L.value["frontend.view.edit"] + " " + _L.value(namespaceNode.value?.data.display || namespaceNode.value?.data.name || "")
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
            try{
                const res = await provider.saveSchema(data)
                if (!res)
                {
                    ElMessage.error(_L.value["frontend.view.error"])
                    return
                }
                data.loadState |= SchemaLoadState.Server
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
    if (namespaceMap.includes(SchemaType.Func)) {
        const funcList = options.filter(r => r.type === SchemaType.Func)
        const blackList: string[] = ["system.schema"]
        for(let i = 0; i < funcList.length; i++)
        {
            const f = await getSchema(funcList[i].value)
            if (f?.type !== SchemaType.Func || !f.func) continue

            // special handling for system entries
            if (enableEntries.value && await isSchemaCanBeUseAs(f.func.return, NS_SYSTEM_ENTRIES))
                continue

            if(f.func.args.length < lowLimit || f.func.args.length > upLimit)
            {
                blackList.push(f.name)
            }
            else if (isscalarvalidfunc) {
                // for scalar value validation only
                if (f.func.args?.length !== 1 || 
                    compatibleType && !/^[tT]\d*$/.test(f.func.args[0].type) && !await isSchemaCanBeUseAs(f.func.args[0].type, compatibleType))
                {
                    blackList.push(f.name)
                }
            }
            else if (isscalarwhitelist)
            {
                // for scalar white list
                if (f.func.args.length > 1) {
                    blackList.push(f.name)
                }
                else if(otherCompatibleType && !/^[tT]\d*$/.test(f.func.return) && !await isSchemaCanBeUseAs(f.func.return, otherCompatibleType))
                {
                    blackList.push(f.name)
                }
                else if(f.func.args.length && !/^[tT]\d*$/.test(f.func.args[0].type) && !await isSchemaCanBeUseAs(compatibleType, f.func.args[0].type))
                {
                    blackList.push(f.name)
                }
            }
            else if (compatibleType && !/^[tT]\d*$/.test(f.func.return) && !await isSchemaCanBeUseAs(f.func.return, compatibleType) &&
                (!otherCompatibleType || !await isSchemaCanBeUseAs(f.func.return, otherCompatibleType))) {
                blackList.push(f.name)
            }
            
            if(rowAccessType && !blackList.includes(f.name) && f.func.args.length !== 1 && !await isSchemaCanBeUseAs(f.func.args[0].type, rowAccessType))
            {
                blackList.push(f.name)
            }
        }
        return blackList
    }
    else if(props.noGeneric)
    {
        const blackList: string[] = ["system.schema"]
        for(let i = 0; i < options.length; i++)
        {
            const genTypes = getGenericParameter(options[i].value)
            if (genTypes?.length) blackList.push(options[i].value)
        }
        return blackList
    }
    else {
        return ["system.schema"]
    }
}

const buildOptions = async (options: ICascaderOptionInfo[], values: INodeSchema[]) => {
    if (!expanded.value) return options
    const nsOnly = namespaceMap.length === 1

    values = values?.filter(v => namespaceMap.includes(v.type)) || []
    values = values.filter(v => !v.name.includes("<")) // filter generic implement types

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
            display: v.display,
            label: _L.value(v.display?.key ? v.display : v.name),
            loadState: v.loadState || 0,
            leaf: v.type !== SchemaType.Namespace || (nsOnly && (!v.schemas?.length || v.schemas.findIndex((s:INodeSchema) => s.type === SchemaType.Namespace) < 0)),
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
    if (!expanded.value) return resolve([])

    try {
        const { value } = node
        if (!value) return resolve([])

        const paths = (root.value?.length ? value.substring(root.value.length + 1) : value).toLowerCase().split(".")
        let ns = root
        for (let i = 0; i < paths.length; i++) {
            const name = (root.value?.length ? `${root.value}.` : "") + paths.slice(0, i + 1).join(".")
            ns = ns.children!.find((c: ICascaderOptionInfo) => c.value.toLowerCase() === name)!
        }
        
        getSchema(value)
        .then((res?: INodeSchema) => {
            buildOptions([], res?.schemas || []).then(r => {
                ns.children = r
                resolve(ns.children)
            })
            .catch(ex => reject && reject(ex))
        })
        .catch((ex:any) => reject && reject(ex))
    }
    catch (ex) {
        return reject && reject(ex)
    }
}

const reBuildOptions = async () => {
    if (!expanded.value) return
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
        else 
        {
            root.value = ""
            compatibleType = "" + enumRoot
        }
    }
    else {
        compatibleType = ""
        root.value = ""
    }

    if (compatibleType && ispushfunctype)
    {
        const ctype = await getSchema(compatibleType)
        if (ctype?.type === SchemaType.Array)
            otherCompatibleType = ctype.array?.element || ""
        else if (ctype)
            otherCompatibleType = (await getArraySchema(ctype, true))?.name || ""
        else
            otherCompatibleType = ""
    }
    else if (compatibleType && isscalarwhitelist)
    {
        otherCompatibleType = (await getArraySchema(compatibleType))?.name || ""
    }

    root.children = await buildOptions([], (await getSchema(root.value))?.schemas || [])
}

const delayRebuildOptions = debounce(reBuildOptions, 300)

const refreshOptions = (options: ICascaderOptionInfo[]) => {
    options.forEach(o => {
        o.label = _L.value(o.display)
        if (o.children?.length) refreshOptions(o.children)
    })
}

// change handler
let dataWatcher: Function | null = null
let stateHandler: Function | null = null
let langHandler: Function | null = null
let exptypeHandler: Function | null = null
let relationtypeHandler: Function | null = null
let policyscopeHandler: Function | null = null

onMounted(() => {
    const parent = scalarNode.parent
    if (scalarNode.config.type === "system.schema.functype" && parent?.config.type === "system.schema.funcexp")
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
            delayRebuildOptions()
        }, true)
    }
    else if (parent instanceof StructNode && parent.getField("type")?.config?.type === "system.schema.relationtype")
    {
        const typeNode = parent.getField("type")
        relationtypeHandler = typeNode!.subscribe(() => {
            enableEntries.value = typeNode?.data == RelationType.WhiteList
        }, true)
    }

    // scalar white list, zero or 1-arg for the base type
    if (isscalarwhitelist) {
        upLimit = 1
        lowLimit = 0
    }

    // push func only allow 1-arg
    if (ispushfunctype) {
        upLimit = 1
        lowLimit = 1
    }

    // evaluator func no arg, account should be fetched from context
    if (type === "system.schema.evaluatorfunc")
    {
        upLimit = 0
        lowLimit = 0
    }
    // row access type for predicate func
    else if (type === "system.schema.predicatefunc") {
        const scopeNode = parent instanceof StructNode ? parent.getField("scope") : undefined
        if (scopeNode){
            policyscopeHandler = scopeNode.subscribe(async () => {
                let access = ""
                let limit = 1
                let fieldNode = parent
                while (fieldNode && fieldNode.config.type !== "system.schema.appfieldschema")
                    fieldNode = fieldNode.parent

                if (fieldNode)
                {
                    const app = (fieldNode as StructNode).getField("app")!.data
                    const fld = (fieldNode as StructNode).getField("name")!.data
                    if (app && fld)
                    {
                        const appSchema = await getAppSchema(app)
                        const col = appSchema?.fields?.find((f: any) => f.name === fld)
                        if (col) {
                            access = col.type
                            const schema = await getSchema(col.type)
                            if (schema?.type == SchemaType.Array)
                            {
                                access = schema.array?.element || ""
                            }
                        }
                    }
                }
                if (access !== rowAccessType || limit != upLimit)
                {
                    upLimit = limit
                    lowLimit = limit
                    rowAccessType = access
                    delayRebuildOptions()
                }
            }, true)
        }
    }

    // data watcher
    dataWatcher = scalarNode.subscribe(async() =>  {
        let data = scalarNode.rawData

        // generic type check
        if (!props.noGeneric && !scalarNode.readonly)
        {
            let name = isNull(data) ? "" : data
            const match = name.match(REGEX_GENERIC_IMPLEMENT)
            const geneiricTypes = match && match.length >= 3 ? match[2].split(",").map((t:string) => t.trim()) : []
            name = match && match.length >= 2 ? match[1] : name
            const schema = name ? getCachedSchema(name) : undefined
            const genTypes = schema ? getGenericParameter(schema) : []

            if (genTypes?.length)
            {
                const genericNodes = [...state.generic || []]
                while(genericNodes.length > genTypes.length)
                    genericNodes.pop()?.dispose()

                for (let i = 0; i < genericNodes.length; i++)
                {
                    genericNodes[i].data = geneiricTypes[i] || ""
                }

                while(genericNodes.length < genTypes.length)
                {
                    const node = new ScalarNode({ type: schema?.type === SchemaType.Array ? "system.schema.arrayeletype" : "system.schema.valuetype", display: _LS("[GENERIC]") }, geneiricTypes[genericNodes.length] || "")
                    node.subscribe(() => setData(state.data))
                    node.rule.disable = state.readonly || state.disable || props.disabled
                    genericNodes.push(node)
                }
                
                state.data = name
                state.generic = genericNodes
                data = name
            }
            else
            {
                state.data = name
                state.generic = undefined
            }
        }
        else
        {
            state.data = data
        }

        if (isNull(data))
            expanded.value = true
        
        // build display
        const paths = (isNull(data) ? "" : data).split(".")
        const display: string[] = []

        // generic check for simple
        while (paths.length > 1 && paths[paths.length - 1].endsWith(">") && !paths[paths.length - 1].includes("<"))
        {
            paths[paths.length - 2] = `${paths[paths.length - 2]}.${paths[paths.length - 1]}`
            paths.pop()
        }

        let option = root
        let rebuild = false
        for (let i = 0; i < paths.length; i++) {
            const name = paths.slice(0, i + 1).join(".")
            const match = option?.children?.find((c: ICascaderOptionInfo) => c.value === name)
            if (match)
            {
                display.push(_L.value(match.label))
                option = match
            }
            else
            {
                rebuild = true
                const schema = await getSchema(name)
                if (!schema) break
                display.push(_L.value(schema.display?.key ? schema.display : paths[i]))
            }
        }
        state.display = display.join("/")
        if (rebuild)
            delayRebuildOptions()
    }, true)

    // state watch
    stateHandler = scalarNode.subscribeState(() => {
        state.disable = scalarNode.rule.disable
        state.require = scalarNode.require
        state.readonly = scalarNode.readonly

        const r = scalarNode.rule.root || null
        if (r !== compatibleType)
        {
            compatibleType = r
            delayRebuildOptions()
        }

        state.generic?.forEach(g => {
            g.rule.disable = state.readonly || state.disable || props.disabled
            g.notifyState()
        })
    }, true)

    // update display
    langHandler = subscribeLanguage(() => {
        if (!root.children) return
        refreshOptions(root.children)
        root.children = [...root.children]
    })

})

onUnmounted(() => {
    if (dataWatcher) dataWatcher()
    if (stateHandler) stateHandler()
    if (langHandler) langHandler()
    if (exptypeHandler) exptypeHandler()
    if (relationtypeHandler) relationtypeHandler()
    if (policyscopeHandler) policyscopeHandler()
})
</script>