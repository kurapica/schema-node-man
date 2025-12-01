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
            checkStrictly: !state.root,
        }" 
        :placeholder="scalarNode.selectPlaceHolder"
        :disabled="state.readonly || state.disable" 
        :clearable="!state.require"
        v-bind="$attrs"
    ></el-cascader>
</template>

<script lang="ts" setup>
import { getCachedSchema, isNull, SchemaType, ScalarNode, getSchema, isSchemaCanBeUseAs, ARRAY_ELEMENT, getAppSchema, _L, StructNode } from "schema-node"
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
const ispush = scalarNode.config.type === "system.schema.apppushfld"

// display state
const state = reactive<{
    data?: any,
    display?: any,
    disable?: boolean,
    require?: boolean,
    readonly?: boolean,
    root?: string,
    inited?: boolean
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

const buildOptions = async (fields: { name: string, type: string, display?: any }[], prefix: string = ""): Promise<ICascaderOptionInfo[]> => {
    const result: ICascaderOptionInfo[] = []
    const root = state.root
    for(let i = 0; i < fields.length; i++)
    {
        const f = fields[i]
        if (isNull(f.name) || isNull(f.type)) continue
        let schema = await getSchema(f.type)
        if (root)
        {
            if (!await isSchemaCanBeUseAs(f.type, root))
            {
                if (ispush && schema?.type === SchemaType.Array && schema.array?.element && await isSchemaCanBeUseAs(schema.array.element, root))
                {
                    result.push({
                        value: `${prefix}${f.name}`,
                        label: `${_L(f.display) || f.name}`,
                        leaf: true,
                        children: null
                    })
                    continue
                }

                const isArray = schema?.type === SchemaType.Array
                if (isArray)
                {
                    schema = getCachedSchema(schema!.array!.element)
                }
                if (schema?.type !== SchemaType.Struct) continue
                let children = await buildOptions(schema.struct!.fields, `${prefix}${f.name}.`)
                if (children.length)
                {
                    result.push({
                        value: `${prefix}${f.name}`,
                        label: `${_L(f.display) || f.name}`,
                        leaf: false,
                        children
                    })
                }
            }
            else
            {
                result.push({
                    value: `${prefix}${f.name}`,
                    label: `${_L(f.display) || f.name}`,
                    leaf: true,
                    children: null
                })
            }
        }
        else
        {
            const isArray = schema?.type === SchemaType.Array
            if (isArray)
            {
                schema = getCachedSchema(schema!.array!.element)
            }
            const option = {
                value: `${prefix}${f.name}`,
                label: `${_L(f.display) || f.name}`,
                leaf: schema?.type !== SchemaType.Struct,
                children: schema?.type === SchemaType.Struct ? await buildOptions(schema.struct!.fields, `${prefix}${f.name}.`) : null
            }
            if (isArray && (schema?.type === SchemaType.Enum || schema?.type === SchemaType.Scalar))
            {
                option.leaf = false
                option.children ||= []
                option.children.unshift ({
                    value: `${prefix}${f.name}.${ARRAY_ELEMENT}`,
                    label: _L["system.schema.reltarfield.ele"],
                    leaf: true,
                    children: null
                })
            }
            result.push(option)
        }
    }
    return result
}

// schema fields
let datahandler: Function | undefined = undefined
let statehandler: Function | undefined = undefined
onMounted(async () => {
    let app = ""
    let parentNode = scalarNode.parent
    while (parentNode)
    {
        if (parentNode.config.type === "system.schema.appfieldschema")
        {
            app = (parentNode as StructNode).getField("app")?.rawData
            break
        }
        else if(parentNode.config.type === "system.schema.appschema")
        {
            app = (parentNode as StructNode).getField("name")?.rawData
            break
        }
        parentNode = parentNode.parent
    }

    const fields = app ? (await getAppSchema(app))!.fields! : []

    // option generate
    const rebuildOptions = async () => options.value = await buildOptions(fields)

    // data handler
    datahandler = scalarNode.subscribe(() => {
        state.data = scalarNode.rawData

        if (props.plainText && scalarNode.readonly)
        {
            if (!state.data) return
            const paths = (state.data as string).split(".")
            if (!paths.length) return
            const fld = fields.find((f:any) => f.name === paths[0])
            if (!fld) return
            paths[0] = _L(fld.display) || fld.name
            
            let type = fld.type
            for(let i = 1; i < paths.length; i++)
            {
                if (!type) break
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array)
                {
                    schema = getCachedSchema(schema.array!.element)
                }
                if (paths[i] === ARRAY_ELEMENT)
                {
                    paths[i] = _L["system.schema.reltarfield.ele"]
                    break
                }
                if (schema?.type !== SchemaType.Struct) break
                const f = schema.struct!.fields.find((d:any) => d.name === paths[i])
                if (!f) break
                paths[i] = `${_L(f.display) || f.name}`
                type = f.type
            }
            state.display = paths.join(" / ")
        }
    }, true)

    statehandler = scalarNode.subscribeState(() => {
        state.readonly = scalarNode.readonly
        state.require = scalarNode.require
        state.disable = scalarNode.rule.disable
        
        if (state.root !== scalarNode.rule.root || !state.inited)
        {
            state.inited = true
            state.root = scalarNode.rule.root
            rebuildOptions()
        }
    }, true)
})

onUnmounted(() => {
    if (datahandler) datahandler()
    if (statehandler) statehandler()
})

</script>