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
                        <el-form v-if="argdatas.length >= i && argdatas[i-1].type" :data="argdatas[i-1].data">
                            <schema-view
                                :key="argdatas[i-1].key"
                                :config="{
                                    type: argdatas[i-1].type,
                                    display: argdatas[i-1].name,
                                    anyLevel: true
                                }"
                                v-model="argdatas[i-1].data"
                                in-form="expandall"
                            ></schema-view>
                        </el-form>
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
                        <pre v-if="result.length >= i">{{ result[i-1] instanceof Date ? result[i-1].toISOString() : result[i-1] }}</pre>
                    </el-card>
                </div>
            </div>
        </el-form-item>
    </section>
</template>

<script setup lang="ts">
import { ArrayNode, callSchemaFunction, ExpressionType, getArraySchema, getSchema, isEqual, isNull, isSchemaCanBeUseAs, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, ScalarNode, ScalarRule, StructNode, type IFunctionArgumentInfo, type IFunctionExpression, type INodeSchema, type IStructEnumFieldConfig } from 'schema-node'
import { ref, toRaw, reactive, onMounted, onUnmounted, watch } from 'vue'
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

const argdatas: { key: string, name: string, type: string, data: any }[] = reactive([])
const result = ref<any[]>([])

let stateHandler: Function | undefined = undefined
let retHandler: Function | undefined = undefined
let argsHandler: Function | undefined = undefined
let expsHandler: Function | undefined = undefined

const refreshArgs = async() => {
    for(let i = 0; i < argsNode.elements.length; i++)
    {
        const { name, type } = argsNode.elements[i].rawData
        if (argdatas.length > i)
        {
            argdatas[i].name = name
            argdatas[i].key = `${name}-${type}`
            if (type !== argdatas[i].type)
            {
                argdatas[i].type = type
                argdatas[i].data = null
            }
        }
        else
        {
            argdatas[i] = reactive({ key: `${name}-${type}`, name, type, data: null })
        }
    }

    await refresh()
}

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
        let arrayType = ""
        let arrayEle = ""
        let isarray = type !== ExpressionType.Call
        let arrIdx = -1
        switch (type)
        {
            case ExpressionType.Filter:
                funcret = NS_SYSTEM_BOOL
                arrayType = ret
                arrayEle = (await getSchema(ret))!.array!.element
                break

            case ExpressionType.First:
            case ExpressionType.Last:
                funcret = NS_SYSTEM_BOOL
                arrayType = (await getArraySchema(ret))!.name
                arrayEle = ret
                break
                
            case ExpressionType.Map:
                funcret = (await getSchema(ret))!.array!.element
                break
        }

        // args
        const fargs = e.getField("args") as ArrayNode
        const finfo = func ? await getSchema(func) : null
        const farglen = finfo?.func?.args.length || 0
        while (fargs.elements.length < farglen) fargs.addRow()
        if (fargs.elements.length > farglen) fargs.delRows(farglen, fargs.elements.length - farglen)
        
        const generic = [...(finfo?.func?.generic || [])]
        if (funcret && /^[tT]\d*$/.test(funcret))
        {
            const gidx = funcret.length > 1 ? parseInt(funcret.substring(1)) - 1 : 0
            if (ret) generic[gidx] = ret
        }

        // adjust type, white list and etc
        for(let k = 0; k < farglen; k++)
        {
            const farg = fargs.elements[k] as StructNode
            const display = farg.getField("display")
            const type = farg.getField("type")
            const name = farg.getField("name")
            
            const carg = finfo!.func!.args[k]
            display.data = `${carg.nullable ? '' : '* '}${carg.name}`
            
            // call argument type
            let ctype = await getSchema(carg.type, generic)
            if (!ctype && /^[tT]\d*$/.test(carg.type))
            {
                // confirm the generic type
                const gidx = funcret.length > 1 ? parseInt(funcret.substring(1)) - 1 : 0
                const n = name.rawData
                if (n)
                {
                    const exp = args.find(a => a.name === n) || exps.find(a => a.name === n)
                    if (exp)
                    {
                        ctype = exp.schema
                        generic[gidx] = exp.schema.name
                    }
                }
            }

            // type value
            type.data = ctype?.name || NS_SYSTEM_STRING
            
            // name white list
            const whitelist: string[] = []
            if (ctype)
            {
                for(let j = 0; j < args.length; j++)
                {
                    if (await isSchemaCanBeUseAs(args[j].schema.name, ctype.name))
                    {
                        whitelist.push(args[j].name)
                    }
                }
                for(let j = 0; j < exps.length; j++)
                {
                    if (await isSchemaCanBeUseAs(exps[j].schema.name, ctype.name))
                    {
                        whitelist.push(exps[j].name)
                    }
                }
            }
            else
            {
                args.forEach(a => whitelist.push(a.name))
                exps.forEach(a => whitelist.push(a.name))
            }
            if (!isEqual((name.rule as ScalarRule).whiteList, whitelist))
            {
                (name.rule as ScalarRule).whiteList = whitelist
                console.log("whitelist", whitelist)
                name.notifyState()
            }
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

// calc
watch(argdatas, async() => {
    // check argument
    let fullfill = true
    const values: { [key:string]: any} = {}

    for(let i = 0; i < argsNode.elements.length; i++)
    {
        const { name, nullable } = argsNode.elements[i].rawData
        const data = toRaw(argdatas[i].data)
        if (isNull(name) || (isNull(data) && !nullable))
        {
            fullfill = false
            break
        }
        values[name] = data
    }

    // clear
    if (!fullfill)
    {
        result.value = []
        return
    }

    // calc
    const ret: any = []
    for(let i = 0; i < expsNode.elements.length; i++)
    {
        const exp = expsNode.elements[i].data as IFunctionExpression
        if (exp.name && exp.func && exp.type)
        {
            const callargs: any[] = []
            if (exp.args?.length)
            {
                let value = null
                for (let j = 0; j < exp.args.length; j++)
                {
                    if (exp.args[i].name)
                    {
                        value = values[exp.args[i].name!]
                    }
                    else
                    {
                        value = exp.args[i].value
                    }
                }
                callargs.push(value || null)
            }
            let res = await callSchemaFunction(exp.func, callargs)
            if (isNull(res)) res = null
            ret[i] = res
            values[exp.name] = res
        }
        else
        {
            ret[i] = null
        }
    }
    result.value = ret
})

onMounted(() => {
    stateHandler = funcNode.subscribeState(() => {
        state.readonly = funcNode.readonly
    }, true)

    retHandler = returnNode.subscribe(refresh)
    expsHandler = expsNode.subscribe(refresh)
    argsHandler = argsNode.subscribe(refreshArgs, true)
})

onUnmounted(() => {
    if (stateHandler) stateHandler()
    if (retHandler) retHandler()
    if (argsHandler) argsHandler()
    if (expsHandler) expsHandler()
})
</script>