<template>
    <table-view
        :node="argsNode"
        no-add no-del
        :in-form="SchemaNodeFormType.ExpandAll"
        plain-text="left"
    ></table-view>
</template>

<script setup lang="ts">
import { ArrayNode, getSchema, NS_SYSTEM_STRING, StructNode } from 'schema-node'
import { onMounted, onUnmounted, toRaw } from 'vue'
import { SchemaNodeFormType, tableView } from 'schema-node-vue-view'

const props = defineProps<{ node: ArrayNode }>()
const argsNode = toRaw(props.node)

let returnHandler: Function | undefined = undefined
let funcHandler: Function | undefined = undefined

onMounted(() => {
    const relationInfo = argsNode.parent as StructNode
    const returnField = relationInfo.getField("return")
    const funcField = relationInfo.getField("func")

    const refresh = async() => {
        const ret = returnField.rawData
        const func = funcField.rawData
        const schema = func ? await getSchema(func) : null
        const args = schema?.func?.args || []
        const generic = [...(schema?.func?.generic || [])]

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
            row.getField("type").data = aschema?.name || NS_SYSTEM_STRING
        }
    }
    
    returnHandler = returnField.subscribe(() => refresh)
    funcHandler = funcField.subscribe(async() =>refresh, true)
})

onUnmounted(() => {
    if (returnHandler) returnHandler()
    if (funcHandler) funcHandler()
})
</script>