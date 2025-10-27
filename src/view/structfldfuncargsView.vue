<template>
    <table-view
        :node="argsNode"
        no-add no-del
        :in-form="SchemaNodeFormType.ExpandAll"
        plain-text="left"
    ></table-view>
</template>

<script setup lang="ts">
import { ArrayNode, getSchema, NS_SYSTEM_STRING, StructNode, RelationType, NS_SYSTEM_ARRAY } from 'schema-node'
import { onMounted, onUnmounted, toRaw } from 'vue'
import { SchemaNodeFormType, tableView } from 'schema-node-vueview'

const props = defineProps<{ node: ArrayNode }>()
const argsNode = toRaw(props.node)

let typeHandler: Function | undefined = undefined
let returnHandler: Function | undefined = undefined
let funcHandler: Function | undefined = undefined

onMounted(() => {
    const relationInfo = argsNode.parent as StructNode
    const typeField = relationInfo.getField("type")
    const returnField = relationInfo.getField("return")
    const funcField = relationInfo.getField("func")
    
    const refresh = async() => {
        const type = typeField.rawData
        const ret = returnField.rawData
        const func = funcField.rawData
        const schema = func ? await getSchema(func) : null
        const args = schema?.func?.args || []
        const generic = schema?.func?.generic ? (Array.isArray(schema.func.generic) ? [...schema.func.generic] : [ schema.func.generic ]) : []
        
        // entrys for whitelist, maybe more common check later
        const matchEntrys = func == "system.conv.assign" && type == RelationType.WhiteList
        
        if (schema?.func?.return && /^[tT]\d*$/.test(schema.func.return))
        {
            const gidx = schema.func.return.length > 1 ? parseInt(schema.func.return.substring(1)) - 1 : 0
            if (ret) generic[gidx] = ret
        }

        if (argsNode.elements.length > args.length)
        {
            argsNode.delRows(args.length, argsNode.elements.length - args.length)
        }
        else if (argsNode.elements.length < args.length)
        {
            while (argsNode.elements.length < args.length)
                argsNode.addRow()
        }

        for(let i = 0; i < args.length; i++)
        {
            const row = argsNode.elements[i] as StructNode
            const aschema = await getSchema(args[i].type, generic)
            if (matchEntrys)
            {
                row.getField("type").data = NS_SYSTEM_ARRAY
            }
            else 
            {
                row.getField("type").data = aschema?.name || NS_SYSTEM_STRING
            }
            if (row.getField("label")) row.getField("label").data = args[i].name
        }
    }
    
    typeHandler = typeField.subscribe(refresh)
    returnHandler = returnField.subscribe(refresh)
    funcHandler = funcField.subscribe(refresh, true)
})

onUnmounted(() => {
    if (typeHandler) typeHandler()
    if (returnHandler) returnHandler()
    if (funcHandler) funcHandler()
})
</script>