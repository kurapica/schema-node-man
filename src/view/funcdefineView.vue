<template>
    <section style="width: 100%;">
        <schema-view
            :node="returnNode"
            in-form="nest"
            plain-text="left"
        ></schema-view>
        <!-- Arguments -->
        <el-form-item
            :key="argsNode?.guid"
            :prop="argsNode?.access">
            <template #label>
                <span><span v-if="argsNode.require" style="color: #f56c6c; font-size: 14px"> * </span>{{ argsNode.display}} </span>
            </template>
            <div class="func-arg-list" style="width: 100%;">
                <template v-if="!state.arglen && !state.readonly">
                    <el-button type="primary" @click="argsNode.addRow()">{{ _L["schema.designer.new"] }}</el-button>
                </template>
                <div v-for="i in state.arglen" class="func-arg" style="display: grid; grid-template-columns: repeat(2, 48%); grid-gap: 12px">
                    <el-card class="box-card" shadow="hover">
                        <schema-view
                            :key="argsNode.elements[i-1].guid"
                            :node="argsNode.elements[i-1]"
                            in-form="expand"
                            plain-text="left"
                        ></schema-view>
                        <div v-if="!state.readonly" class="bottom clearfix">
                            <el-button type="primary" @click="argsNode.addRow(i)">{{ _L["schema.designer.new"] }}</el-button>
                            <el-button type="danger" style="float: right" @click="argsNode.delRows(i - 1)">{{ _L["schema.designer.delete"] }}</el-button>
                        </div>
                    </el-card>
                    <el-card shadow="hover">
                    </el-card>
                </div>
            </div>
        </el-form-item>
        <!-- Exps -->
        <el-form-item
            :key="expsNode?.guid"
            :prop="expsNode?.access">
            <template #label>
                <span><span v-if="expsNode.require" style="color: #f56c6c; font-size: 14px"> * </span>{{ expsNode.display}} </span>
            </template>
            <div class="func-arg-list" style="width: 100%;">
                <template v-if="!state.arglen && !state.readonly">
                    <el-button type="primary" @click="expsNode.addRow()">{{ _L["schema.designer.new"] }}</el-button>
                </template>
                <div v-for="i in state.arglen" class="func-arg" style="display: grid; grid-template-columns: repeat(2, 48%); grid-gap: 12px">
                    <el-card class="box-card" shadow="hover">
                        <schema-view
                            :key="expsNode.elements[i-1].guid"
                            :node="expsNode.elements[i-1]"
                            in-form="expandall"
                            plain-text="left"
                            no-add
                            no-del
                            style="width: 100%;"
                        ></schema-view>
                        <div v-if="!state.readonly" class="bottom clearfix">
                            <el-button type="primary" @click="expsNode.addRow(i)">{{ _L["schema.designer.new"] }}</el-button>
                            <el-button type="danger" style="float: right" @click="expsNode.delRows(i - 1)">{{ _L["schema.designer.delete"] }}</el-button>
                        </div>
                    </el-card>
                    <el-card shadow="hover">
                    </el-card>
                </div>
            </div>
        </el-form-item>
    </section>
</template>

<script setup lang="ts">
import { ArrayNode, ExpressionType, getSchema, ScalarNode, StructNode, type INodeSchema } from 'schema-node'
import { toRaw, reactive, onMounted, onUnmounted } from 'vue'
import { _L } from 'schema-node-vue-view'
import schemaView from 'schema-node-vue-view'

const props = defineProps<{ node: StructNode }>()
const funcNode = toRaw(props.node)
const returnNode = funcNode.getField("return") as ScalarNode
const argsNode = funcNode.getField("args") as ArrayNode
const expsNode = funcNode.getField("exps") as ArrayNode

const state = reactive({
    readonly: false,
    return: "",
    arglen: 0,
    explen: 0,
})

let stateHandler: Function | undefined = undefined
let retHandler: Function | undefined = undefined
let argsHandler: Function | undefined = undefined
let expsHandler: Function | undefined = undefined

const refresh = async() => {
    state.return = returnNode.rawData
    state.arglen = argsNode.elements.length
    state.explen = expsNode.elements.length

    // args refresh
    const args: { name: string, schema: INodeSchema }[] = []
    for (let i = 0; i < argsNode.elements.length; i++)
    {
        const a = argsNode.elements[i]
        const { name, type } = a.rawData
        if (name && type)
        {
            const schema = await getSchema(type)
            if (schema)
            {
                args.push({ name, schema })
            }
        }
    }

    // exps refresh
    const exps: { name: string, schema: INodeSchema }[] = []
    for (let i = 0; i < expsNode.elements.length; i++)
    {
        const e = expsNode.elements[i] as StructNode
        const { name, type, func } = e.rawData
        const ret = e.rawData.return

        let funcret = ret
        switch (type)
        {
            case ExpressionType.Filter:
                break
            case ExpressionType.First:
                break
            case ExpressionType.Last:
                break
            case ExpressionType.Map:
                break
            case ExpressionType.Reduce:
                break
        }

        // args
        const fargs = e.getField("args") as ArrayNode
        const finfo = func ? await getSchema(func) : null
        const farglen = finfo?.func?.args.length || 0
        while (fargs.elements.length < farglen) fargs.addRow()
        if (fargs.elements.length > farglen) fargs.delRows(farglen, fargs.elements.length - farglen)
        
        const generic = [...(finfo?.func?.generic || [])]
        if (finfo?.func?.return && /^[tT]\d*$/.test(finfo.func.return))
        {
            const gidx = finfo.func.return.length > 1 ? parseInt(finfo.func.return.substring(1)) - 1 : 0
            if (ret) generic[gidx] = ret
        }

        // save
        if (name && ret)
        {
            const schema = await getSchema(ret)
            if (schema)
            {
                exps.push({ name, schema })
            }
        }
    }
}

onMounted(() => {
    stateHandler = funcNode.subscribeState(() => {
        state.readonly = funcNode.readonly
    }, true)

    retHandler = returnNode.subscribe(refresh)
    argsHandler = argsNode.subscribe(refresh)
    expsHandler = expsNode.subscribe(refresh, true)
})

onUnmounted(() => {
    if (stateHandler) stateHandler()
    if (retHandler) retHandler()
    if (argsHandler) argsHandler()
    if (expsHandler) expsHandler()
})
</script>