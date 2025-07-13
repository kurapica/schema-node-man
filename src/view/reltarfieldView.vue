<template>
    <span v-if="state.readonly && plainText"
        :style="{ 'width': '100%', 'text-align': plainText === true ? 'center' : plainText }">
        {{ state.display }}
    </span>
    <el-cascader v-else
        v-model="data" 
        style="width: 100%" 
        :options="options" 
        :props="{
            emitPath: false,
            checkStrictly: true,
        }" 
        :placeholder="scalarNode.selectPlaceHolder"
        :disabled="state.readonly || state.disable" 
        :clearable="!state.require"
        v-bind="$attrs"
    ></el-cascader>
</template>

<script lang="ts" setup>
import { ArrayNode, getCachedSchema, isNull, SchemaType, StructNode, ScalarNode } from "schema-node"
import { computed, onMounted, onUnmounted, reactive, ref, toRaw } from "vue"

//#region Inner type
interface ICascaderOptionInfo {
    value: string
    label: string
    leaf: boolean
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
const options = ref<ICascaderOptionInfo[]>([])

const buildOptions = (fields: { name: string, type: string, display?: any }[], prefix: string = ""): ICascaderOptionInfo[] => {
    return fields.filter(f => !isNull(f.name) && !isNull(f.type)).map(f => {
        let schema = getCachedSchema(f.type)
        if (schema?.type === SchemaType.Array)
        {
            schema = getCachedSchema(schema.array!.element)
        }
        return {
            value: `${prefix}${f.name}`,
            label: `${f.display || f.name}`,
            leaf: schema?.type !== SchemaType.Struct,
            children: schema?.type === SchemaType.Struct ? buildOptions(schema.struct!.fields, `${prefix}${f.name}.`) : null
        }
    })
}

// schema fields
let datahandler: Function | undefined = undefined
let statehandler: Function | undefined = undefined
let fieldsHandler: Function | undefined = undefined
const fieldsHandlers: { guid: string, name: Function, type: Function }[] = []
onMounted(() => {
    let parentNode = scalarNode.parent
    while (parentNode && parentNode.config.type !== "schema.structdefine")
        parentNode = parentNode.parent
    if (!parentNode) return

    const fieldsNode = (parentNode as StructNode).getField("fields") as ArrayNode

    // data handler
    datahandler = scalarNode.subscribe(() => {
        state.data = scalarNode.rawData

        if (props.plainText && scalarNode.readonly)
        {
            if (!state.data) return
            const paths = (state.data as string).split(".")
            if (!paths.length) return
            const fld = fieldsNode.data.find((f:any) => f.name === paths[0])
            if (!fld) return
            paths[0] = fld.display || fld.name
            
            let type = fld.type
            for(let i = 1; i < paths.length; i++)
            {
                if (!type) break
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array)
                {
                    schema = getCachedSchema(schema.array!.element)
                }
                if (schema?.type !== SchemaType.Struct) break
                const f = schema.struct!.fields.find(d => d.name === paths[i])
                if (!f) break
                paths[i] = `${f.display || f.name}`
                type = f.type
            }
            state.display = paths.join(" / ")
        }
    }, true)

    statehandler = scalarNode.subscribeState(() => {
        state.readonly = scalarNode.readonly
        state.require = scalarNode.require
        state.disable = scalarNode.rule.disable
    }, true)

    if (props.plainText && scalarNode.readonly) return

    // option generate
    const rebuildOptions = () => options.value = buildOptions(fieldsNode.data)

    let length = 0
    fieldsHandler = fieldsNode.subscribe((action: string) => {
        const elements = fieldsNode.elements
        const currlen = elements.length
        if (currlen !== length || action === "swap")
        {
            length = currlen
            for(let i = 0; i < elements.length; i++)
            {
                const ele = elements[i] as StructNode
                if (fieldsHandlers.length > i) 
                {
                    if (ele.guid === fieldsHandlers[i].guid) continue
                    fieldsHandlers[i].name()
                    fieldsHandlers[i].type()
                }
                fieldsHandlers[i] = {
                    guid: ele.guid,
                    name: ele.getField("name").subscribe(rebuildOptions),
                    type: ele.getField("type").subscribe(rebuildOptions)
                }
            }
            for(let i = fieldsHandlers.length - 1; i >= currlen; i--)
            {
                const handler = fieldsHandlers.pop()
                handler?.name()
                handler?.type()
            }

            rebuildOptions()
        }
    }, true)


})

onUnmounted(() => {
    if (fieldsHandler) fieldsHandler()
    if (datahandler) datahandler()
    if (statehandler) statehandler()
    fieldsHandlers.forEach(f => {
        f.name()
        f.type()
    })
})

</script>