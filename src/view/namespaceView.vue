<template>
    <span v-if="state.readonly && plainText"
        :style="{ 'width': '100%', 'color': 'green', 'text-align': plainText === true ? 'center' : plainText }">
        {{ state.display }}
    </span>
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
        :placeholder="scalarNode.selectPlaceHolder"
        :disabled="state.disable" :clearable="!state.require"
        v-bind="$attrs"
    ></el-cascader>
</template>

<script lang="ts" setup>
import { EnumValueType, getSchema, isSchemaCanBeUseAs, SchemaType, type INodeSchema, type ScalarNode } from "schema-node"
import { computed, onMounted, onUnmounted, reactive, ref, toRaw } from "vue"

//#region Inner type
interface ICascaderOptionInfo {
    value: string
    type: SchemaType
    label: string
    leaf: boolean
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

// cascader root
const root = reactive<ICascaderOptionInfo>({
    value: "",
    type: SchemaType.Namespace,
    label: "",
    leaf: false,
    children: null
})
const compatibleType = ref("") // 兼容类型

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
}[type]

const genBlackList = async (options: ICascaderOptionInfo[]): Promise<string[]> => {
    // check compatible type
    if (compatibleType.value && namespaceMap.includes(SchemaType.Function)) {
        const funcList = options.filter(r => r.type === SchemaType.Function)
        const blackList: string[] = ["schema"]
        for(let i = 0; i < funcList.length; i++)
        {
            const f = await getSchema(funcList[i].value)
            if (f?.type !== SchemaType.Function || !f.func) continue
            if (!/^[tT]\d*$/.test(f.func.return) && !await isSchemaCanBeUseAs(f.func.return, compatibleType.value)) {
                blackList.push(f.name)
            }
        }
        return []
    }
    else {
        return ["schema"]
    }
}

const buildOptions = async (options: ICascaderOptionInfo[], values: INodeSchema[]) => {
    const nsOnly = namespaceMap.length === 1

    values = values?.filter(v => namespaceMap.includes(v.type)) || []

    // filter for array element
    if (type === "schema.arrayeletype") {
        const filters = []
        for (let i = 0; i < values.length; i++) {
            if (values[i].type === SchemaType.Enum) {
                const enumInfo = await getSchema(values[i].name)
                if (enumInfo?.enum?.type !== EnumValueType.Flags)
                    filters.push(values[i])
            }
            else {
                filters.push(values[i])
            }
        }
        values = filters
    }

    // generate
    const result: ICascaderOptionInfo[] = []
    for (let i = 0; i < values.length; i++) {
        const v = values[i]
        const ele: ICascaderOptionInfo = {
            value: v.name,
            type: v.type,
            label: `${v.desc || v.name}`,
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
            compatibleType.value = ""
        }
        else if (rootType.type === SchemaType.Namespace) {
            root.value = enumRoot
            compatibleType.value = ""
        }
        else {
            root.value = ""
            compatibleType.value = "" + enumRoot
        }
    }
    else {
        compatibleType.value = ""
        root.value = ""
    }

    root.children = await buildOptions([], (await getSchema(root.value))?.schemas || [])
}

// change handler
let dataWatcher: Function | null = null
let stateHandler: Function | null = null

onMounted(() => {
    let root: any = undefined
    dataWatcher = scalarNode.subscribe(async() =>  {
        const data = scalarNode.rawData
        state.data = data
        
        const paths = (data || "").split(".")
        const display: string[] = []
        for (let i = 0; i < paths.length; i++) {
            const name = paths.slice(0, i + 1).join(".")
            const schema = await getSchema(name)
            if (!schema) break
            display.push(`${schema.desc || paths[i]}`)
        }
        state.display = display.join("/")
    }, true)

    stateHandler = scalarNode.subscribeState(() => {
        state.disable = scalarNode.rule.disable
        state.require = scalarNode.require
        state.readonly = scalarNode.readonly

        const r = scalarNode.rule.root || null
        if (r !== root)
        {
            root = r
            reBuildOptions()
        }
    }, true)
})

onUnmounted(() => {
    if (dataWatcher) dataWatcher()
    if (stateHandler) stateHandler()
})
</script>