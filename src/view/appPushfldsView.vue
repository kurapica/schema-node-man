<template>
    <el-table :data="rows" :border="true" header-align="left" :header-cell-style="{ background: '#eee' }">
        <el-table-column align="left" prop="label" :label="_L['system.schema.appfieldvalarg']" min-width="120" />
        <el-table-column align="left" :label="_L['system.schema.appfield']" min-width="120">
            <template #default="scope">
                <schema-view :node="scope.row.node" :plain-text="plainText"></schema-view>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup lang="ts">
import { ArrayNode, getSchema, ScalarNode, SchemaType, StructNode } from 'schema-node'
import { onMounted, onUnmounted, ref, toRaw } from 'vue'
import { _L, schemaView } from 'schema-node-vueview'

const props = defineProps<{ node: ArrayNode, plainText?: any }>()
const argsNode = toRaw(props.node)
const rows = ref<{
    label: string,
    node: ScalarNode
}[]>([])

let returnHandler: Function | undefined = undefined
let funcHandler: Function | undefined = undefined

onMounted(() => {
    const fieldDefine = argsNode.parent as StructNode
    const returnField = fieldDefine.getField("type")
    const funcField = fieldDefine.getField("func")
    
    const refresh = async() => {
        let ret = returnField.rawData
        const func = funcField.rawData
        const schema = func ? await getSchema(func) : null
        const args = schema?.func?.args || []
        const generic = schema?.func?.generic ? (Array.isArray(schema.func.generic) ? [...schema.func.generic] : [ schema.func.generic ]) : []

        if (schema?.func?.return && /^[tT]\d*$/.test(schema.func.return))
        {
            const gidx = schema.func.return.length > 1 ? parseInt(schema.func.return.substring(1)) - 1 : 0
            if (ret) {
                // for generic func, use array element if possible
                const retSchema = await getSchema(ret)
                if (retSchema?.type === SchemaType.Array && retSchema.array?.element) ret = retSchema.array.element
                generic[gidx] = ret
            }
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

        const displays = []

        for(let i = 0; i < args.length; i++)
        {
            const row = argsNode.elements[i] as ScalarNode
            const aschema = await getSchema(args[i].type, generic)
            row.rule.root = aschema?.name || ""
            row.notifyState()
            displays.push({
                label: args[i].name,
                node: row
            })
        }
        rows.value = displays
    }
    
    returnHandler = returnField.subscribe(refresh)
    funcHandler = funcField.subscribe(refresh, true)
})

onUnmounted(() => {
    if (returnHandler) returnHandler()
    if (funcHandler) funcHandler()
})
</script>