<template>
    <span v-if="state.readonly && plainText" :style="{'width': '100%', 'display': 'inline-block', 'text-align': plainText === true ? 'center' : plainText }">
        {{ state.display }}
    </span>
    <el-select
        v-else
        v-model="data"
        style="width: 100%;min-width: 120px;"
        :disabled="state.readonly || state.disable"
        :clearable="!state.require"
        :placeholder="scalarNode.selectPlaceHolder">
        <el-option
            v-for="item in state.whiteList"
            :key="typeof(item) === 'object' ? item.value : item"
            :label="typeof(item) === 'object' ? item.label : item"
            :value="typeof(item) === 'object' ? item.value : item">
        </el-option>
    </el-select>
</template>

<script lang="ts" setup>
import { type AnySchemaNode, _L, getAppSchema, isNull, isSchemaCanBeUseAs, ScalarNode, StructNode, type IAppSchema } from 'schema-node'
import { computed, onMounted, onUnmounted, reactive, toRaw } from 'vue'

// Define props
const props = defineProps<{
    /**
     * Scalar schema node
     */
    node: ScalarNode,

    /**
     * Display readon only value as plain text
     */
    plainText?: any
}>()
const scalarNode = toRaw(props.node)

// display state
const state = reactive<{
    data?: any,
    default?: any,
    display?: any,
    disable?: boolean,
    require?: boolean,
    readonly?: boolean,
    whiteList?: { 
        value: string,
        label: string
    }[]
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

// data & state watcher
let dataWatcher: Function | null = null
let appWatcher: Function | null = null
let stateWatcher: Function | null = null

onMounted(() => {
    const node = scalarNode
    let parent = node.parent
    while (parent && !(parent instanceof StructNode && parent.fields?.find((f:AnySchemaNode) => f.schemaName === "system.schema.app"))) {
        parent = parent.parent
    }
    let srcAppNode = parent?.fields?.find((f:AnySchemaNode) => f.schemaName === "system.schema.app") as ScalarNode
    
    let appSchema: IAppSchema | undefined = undefined
    let type: string  = node.rule.root

    const refreshWhiteList = async () => {
        if (appSchema?.fields?.length)
        {
            const whiteList = []
            for(let i = 0; i < appSchema.fields.length; i++)
            {
                const f = appSchema.fields[i]
                if (!type || await isSchemaCanBeUseAs(f.type, type))
                    whiteList.push({
                        value: f.name,
                        label: _L(f.display) || f.name
                    })
            }
            state.whiteList = whiteList
        }
        else
            state.whiteList = []
        state.display = state.whiteList?.find(w => w.value === node.rawData)?.label || node.rawData
    }

    appWatcher = srcAppNode?.subscribe(async () => {
        const app = srcAppNode?.rawData || ""
        appSchema = app ? await getAppSchema(app) : undefined
        await refreshWhiteList()
    }, true)

    dataWatcher = node.subscribe(() => {
        const data = node.rawData
        state.data = data
        state.display = `${!isNull(data) ? data : ''}`
        state.display = state.whiteList?.find(w => w.value === node.rawData)?.label || node.rawData
    }, true)

    stateWatcher = node.subscribeState(async () => {
        state.default = node.rule.default
        state.disable = node.rule.disable
        state.require = node.require
        state.readonly = node.readonly

        const root = node.rule.root || ""
        if (root !== type) {
            type = root
            await refreshWhiteList()
        }
    }, true)
})

onUnmounted(() => {
    if (appWatcher) appWatcher()
    if (dataWatcher) dataWatcher()
    if (stateWatcher) stateWatcher()
})

</script>