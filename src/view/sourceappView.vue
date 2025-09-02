<template>
    <section style="width: 100%;">
        <template v-if="state.readonly && plainText">
            {{ state.display }}
        </template>
        <el-cascader v-else
            v-model="data" 
            style="width: 100%" 
            :options="root.children" 
            :props="{
                emitPath: false,
                checkStrictly: true,
                lazy: true,
                lazyLoad: lazyLoad
            }" 
            :placeholder="getSelectPlaceHolder(scalarNode)"
            :disabled="state.readonly || state.disable" :clearable="!state.require"
            v-bind="$attrs">
            <template #default="{ data }">
                {{ data.label }}
            </template>
        </el-cascader>
    </section>
</template>

<script lang="ts" setup>
import { getAppSchema, subscribeAppSchemaChange, subscribeLanguage, type IAppSchema, type ScalarNode } from "schema-node"
import { _L, getSelectPlaceHolder } from "schema-node-vueview"
import { computed, onMounted, onUnmounted, reactive, toRaw } from "vue"

//#region Inner type
interface ICascaderOptionInfo {
    value: string
    label: string
    leaf: boolean
    loadState: number
    children: ICascaderOptionInfo[] | null
}
//#endregion

const props = defineProps<{ node: ScalarNode, plainText?: any, disabled?: boolean }>()
const scalarNode = toRaw(props.node)

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
    label: "",
    leaf: false,
    loadState: 0,
    children: null
})
let compatibleType = "" // 兼容类型

const buildOptions = async (options: ICascaderOptionInfo[], values: IAppSchema[]) => {
    // sort
    values.sort((a, b) => a.name < b.name ? -1 : 1)

    // generate
    for (let i = 0; i < values.length; i++) {
        const v = values[i]
        const ele: ICascaderOptionInfo = {
            value: v.name,
            label: `${v.display || v.name}`,
            loadState: v.loadState || 0,
            leaf: (v.hasFields || v.fields?.length || !(v.hasApps || v.apps?.length)) ? true : false,
            children: null
        }
        if (!ele.leaf && v.apps?.length) {
            ele.children = []
            await buildOptions(ele.children, v.apps)
        }
        options.push(ele)
    }

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

        getAppSchema(value)
        .then(res => {
            buildOptions([], res?.apps || []).then(r => {
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
        const rootType = await getAppSchema(enumRoot)
        if (!rootType) {
            root.value = ""
        }
        else {
            root.value = enumRoot
        }
    }
    else {
        root.value = ""
    }

    root.children = await buildOptions([], (await getAppSchema(root.value))?.apps || [])
}

// change handler
let dataWatcher: Function | null = null
let stateHandler: Function | null = null
let langHandler: Function | null = null
let appChangeHandler: Function | null = null

onMounted(() => {
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
                const schema = await getAppSchema(name)
                if (!schema) break
                display.push(`${schema.display || paths[i]}`)
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

    // rebuild when app schema changed
    appChangeHandler = subscribeAppSchemaChange(reBuildOptions)
})

onUnmounted(() => {
    if (dataWatcher) dataWatcher()
    if (stateHandler) stateHandler()
    if (langHandler) langHandler()
    if (appChangeHandler) appChangeHandler()
})
</script>