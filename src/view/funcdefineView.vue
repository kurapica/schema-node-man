<template>
    <section style="width: 100%;">
        <schema-view :node="returnNode" in-form="nest" plain-text="left"></schema-view>
        
        <!-- Arguments -->
        <el-form-item :key="argsNode?.guid" :prop="argsNode?.access">
            <template #label>
                <span><span v-if="argsNode.require" style="color: #f56c6c; font-size: 14px"> * </span>{{ _L(argsNode.display) }} </span>
            </template>
            <div class="func-arg-list" style="width: 100%;">
                <template v-if="!state.arglen && !state.readonly">
                    <el-button type="primary" @click="argsNode.addRow()">{{ _L["frontend.view.new"] }}</el-button>
                </template>
                <div v-for="i in state.arglen" class="func-arg"
                    style="display: grid; grid-template-columns: repeat(2, 48%); grid-gap: 12px">
                    <el-card class="box-card" shadow="hover" :style="{ ['background-color']: argColor[i-1] || 'white' }">
                        <schema-view v-if="argsNode.elements[i - 1]" 
                            :key="argsNode.elements[i - 1].guid" 
                            :node="argsNode.elements[i - 1]"
                            in-form="expand" plain-text="left"
                        ></schema-view>
                        <div v-if="!state.readonly" class="bottom clearfix">
                            <el-button type="primary" @click="argsNode.addRow(i)">{{ _L["frontend.view.new"] }}</el-button>
                            <el-button type="danger" style="float: right" @click="argsNode.delRows(i - 1)">{{ _L["frontend.view.delete"] }}</el-button>
                        </div>
                    </el-card>
                    <el-card shadow="hover">
                        <el-form v-if="argdatas.length >= i && argdatas[i - 1].type" :data="argdatas[i - 1].data">
                            <template v-if="!argdatas[i - 1].showdata">
                                <schema-view 
                                    :key="argdatas[i - 1].key" 
                                    :config="({
                                        type: argdatas[i - 1].type,
                                        display: _LS(argdatas[i - 1].name),
                                        anyLevel: true
                                    } as IStructEnumFieldConfig)" 
                                    v-model="argdatas[i - 1].data"
                                    in-form="expandall"
                                ></schema-view>
                                <br/>
                                <el-button type="info"  class="bottom clearfix" @click="argdatas[i - 1].showdata = true">{{ _L["frontend.view.showdata"] }}</el-button>
                            </template>
                            <template v-else>
                                <pre>{{ argdatas[i - 1].data }}</pre>
                                <br/>
                                <el-button type="info"  class="bottom clearfix" @click="argdatas[i - 1].showdata = false">{{ _L["frontend.view.showform"] }}</el-button>
                            </template>
                        </el-form>
                    </el-card>
                </div>
            </div>
        </el-form-item>

        <!-- Exps -->
        <el-form-item :key="expsNode?.guid" :prop="expsNode?.access">
            <template #label>
                <span><span v-if="expsNode.require" style="color: #f56c6c; font-size: 14px"> * </span>{{ _L(expsNode.display) }} </span>
            </template>
            <div class="func-arg-list" style="width: 100%;">
                <template v-if="!state.explen && !state.readonly">
                    <el-button type="primary" @click="expsNode.addRow()">{{ _L["frontend.view.new"] }}</el-button>
                </template>
                <div v-for="i in state.explen" class="func-arg" style="display: grid; grid-template-columns: repeat(2, 48%); grid-gap: 12px">
                    <el-card class="box-card" shadow="hover" :style="{ ['background-color']: color[i-1] || 'white' }">
                        <schema-view v-if="expsNode.elements[i - 1]" 
                            :key="expsNode.elements[i - 1].guid" 
                            :node="expsNode.elements[i - 1]"
                            in-form="expandall" plain-text="left" 
                            no-add no-del style="width: 100%;"
                        ></schema-view>
                        <div v-if="!state.readonly" class="bottom clearfix">
                            <el-button type="primary" @click="expsNode.addRow(i)">{{ _L["frontend.view.new"] }}</el-button>
                            <el-button type="danger" style="float: right" @click="expsNode.delRows(i - 1)">{{ _L["frontend.view.delete"] }}</el-button>
                        </div>
                    </el-card>
                    <el-card shadow="hover">
                        <pre v-if="result.length >= i">{{ result[i - 1] instanceof Date ? result[i - 1].toISOString() : result[i - 1] }}</pre>
                    </el-card>
                </div>
            </div>
        </el-form-item>
    </section>
</template>

<script setup lang="ts">
import { _LS, getFieldAccessWhiteList, NS_SYSTEM_CONTEXT, clearDebounce, ArrayNode, callSchemaFunction, debounce, ExpressionType, getArraySchema, getSchema, isEqual, isNull, isSchemaCanBeUseAs, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, ScalarNode, ScalarRule, SchemaType, StructNode, type IFunctionExpression, type INodeSchema, type IStructEnumFieldConfig, type AnySchemaNode, getAppSchema, RuleSchema } from 'schema-node'
import { ref, toRaw, reactive, onMounted, onUnmounted, watch } from 'vue'
import { _L, schemaView } from 'schema-node-vueview'

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

const argdatas: { key: string, name: string, type: string, data: any, showdata: boolean }[] = reactive([])
const result = ref<any[]>([])
const argColor = ref<string[]>([])
const color = ref<string[]>([])

interface ArgInfo {
    type?: string,
    display?: string,
    whiteList?: any[],
}

const refreshFieldFunc = async(args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
    const expName = args[0].getField("name").rawData
    let exp = typeMap.get(expName)
    if (exp?.type === SchemaType.Array && exp.array?.element)
        exp = await getSchema(exp.array.element)
    if (exp && exp.type === SchemaType.Struct && exp.struct?.fields.length) {
        return [{}, { type: NS_SYSTEM_STRING, whiteList: await getFieldAccessWhiteList(ret || "", exp.struct.fields, undefined, true) }]
    }
    return []
}

const refreshAppDataFetchFunc = async(args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
    const app = args[0].getField("value").rawData
    const appSchema = !isNull(app) ? await getAppSchema(app) : undefined
    const result: ArgInfo[] = [{}]

    if (!appSchema) return result
    result.push({ whiteList: await getFieldAccessWhiteList("", appSchema.fields || [], undefined, true) })

    const fname = args[1].getField("value").rawData
    const field = !isNull(fname) ? appSchema.fields?.find(f => f.name === fname) : undefined

    // field not selected
    if (!field) return result

    let fieldSchema = await getSchema(field.type)
    if (fieldSchema?.type === SchemaType.Array && fieldSchema.array?.element && fieldSchema.array?.primary?.length)
    {
        const primarys = fieldSchema.array.primary
        fieldSchema = await getSchema(fieldSchema.array.element)
        if (fieldSchema?.type === SchemaType.Struct && fieldSchema.struct?.fields.length)
        {
            for (let i = 0; i < primarys.length; i++)
            {
                const f = fieldSchema.struct!.fields.find(f => f.name === primarys[i])
                if (f) {
                    result.push({ type: f.type })
                }
                else {
                    result.push({})
                }
            }
        }
    }
    return result
}

const specialFuncRefresh: { [key: string]: (args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => Promise<ArgInfo[]> } = {
    // field access
    "system.collection.delfield": refreshFieldFunc,
    "system.collection.getfield": refreshFieldFunc,
    "system.collection.getfields":refreshFieldFunc,
    "system.collection.setfield": refreshFieldFunc,

    // field equal
    "system.collection.fieldequal":async(args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
        const expName = args[0].getField("name").rawData
        let exp = typeMap.get(expName)
        if (exp?.type === SchemaType.Array && exp.array?.element)
            exp = await getSchema(exp.array.element)
        if (exp && exp.type === SchemaType.Struct && exp.struct?.fields.length) {
            const result:any = [{}, { type: NS_SYSTEM_STRING, whiteList: await getFieldAccessWhiteList("", exp.struct.fields, undefined, true) }]
            const fldName = args[1].getField("value").rawData
            const field = !isNull(fldName) ? exp.struct.fields.find(f => f.name === fldName) : undefined
            if (field) {
                result.push({ type: field.type })
            }
            return result
        }
        return []
    },

    // fetch context item
    "system.data.getcontextitem": async(args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
        const contextSchema = await getSchema(NS_SYSTEM_CONTEXT)
        return [{ type: ret, whiteList: await getFieldAccessWhiteList(ret || "", contextSchema?.struct?.fields || [])}]
    },

    // app data fetch
    "system.data.getappdata": refreshAppDataFetchFunc,
    "system.data.getappdatabyonekey": refreshAppDataFetchFunc,
    "system.data.getappdatabytwokey": refreshAppDataFetchFunc,
    "system.data.getappdatabythreekey": refreshAppDataFetchFunc,
    "system.data.getappdatabyfourkey": refreshAppDataFetchFunc,
}

let stateHandler: Function | undefined = undefined
let retHandler: Function | undefined = undefined
let argsHandler: Function | undefined = undefined
let expsHandler: Function | undefined = undefined

const doCaclc = async () => {
    // check argument
    let fullfill = true
    const values: { [key: string]: any } = {}
    const arraymap: { [key:string]: string } = {}

    for (let i = 0; i < argsNode.elements.length; i++) {
        const { name, nullable, type } = argsNode.elements[i].rawData
        const data = toRaw(argdatas[i].data)
        if (isNull(type) || isNull(name) || (isNull(data) && !nullable)) {
            fullfill = false
            break
        }
        values[name] = data
        
        // record the array type map
        const schema = await getSchema(type)
        if (schema?.type === SchemaType.Array)
            arraymap[name] = schema.array?.element || ""
    }

    // clear
    if (!fullfill) {
        result.value = []
        return
    }

    // calc
    const ret: any = []
    for (let i = 0; i < expsNode.elements.length; i++) {
        const exp = expsNode.elements[i].data as IFunctionExpression
        if (exp.name && exp.func && exp.type) {
            const funcinfo = await getSchema(exp.func)
            const isarray = exp.type !== ExpressionType.Call
            let arrIdx = -1
            const fargs = funcinfo?.func?.args || []

            const callargs: any[] = []
            if (exp.args?.length) {
                let value = null
                for (let j = 0; j < exp.args.length; j++) {
                    if (exp.args[j].name) {
                        value = values[exp.args[j].name!]

                        // check array
                        let atype = fargs[j].type
                        if (/^[tT]\d*$/.test(atype))
                        {
                            const gidx = atype.length > 1 ? parseInt(atype.substring(1)) - 1 : 0
                            atype = (Array.isArray(funcinfo?.func?.generic) ? funcinfo.func.generic[gidx] : gidx === 0 ? funcinfo?.func?.generic : "") || ""
                        }

                        if (isarray && arrIdx < 0 && arraymap[exp.args[j].name!] && (!atype || await isSchemaCanBeUseAs(arraymap[exp.args[j].name!], atype)))
                        {
                            arrIdx = j
                        }
                    }
                    else {
                        value = exp.args[j].value
                    }
                    callargs.push(!isNull(value) ?  value : null)
                }
            }

            let res: any = null
            switch(exp.type)
            {
                case ExpressionType.Call:
                    res = await callSchemaFunction(exp.func, callargs)
                    break
                
                case ExpressionType.First:
                    if (arrIdx >= 0)
                    {
                        const array = callargs[arrIdx]
                        if (Array.isArray(array))
                        {
                            for(let l = 0; l < array.length; l++)
                            {
                                callargs[arrIdx] = array[l]
                                if (await callSchemaFunction(exp.func, callargs))
                                {
                                    res = array[l]
                                    break
                                }
                            }
                        }
                    }
                    break

                case ExpressionType.Last:
                    if (arrIdx >= 0)
                    {
                        const array = callargs[arrIdx]
                        if (Array.isArray(array))
                        {
                            for(let l = array.length - 1; l >= 0; l--)
                            {
                                callargs[arrIdx] = array[l]
                                if (await callSchemaFunction(exp.func, callargs))
                                {
                                    res = array[l]
                                    break
                                }
                            }
                        }
                    }
                    break
                
                case ExpressionType.Map:
                    res = []
                    if (arrIdx >= 0)
                    {
                        const array = callargs[arrIdx]
                        if (Array.isArray(array))
                        {
                            for(let l = 0; l < array.length; l++)
                            {
                                callargs[arrIdx] = array[l]
                                res.push(await callSchemaFunction(exp.func, callargs))
                            }
                        }
                    }
                    break

                case ExpressionType.Filter:
                    res = []
                    if (arrIdx >= 0)
                    {
                        const array = callargs[arrIdx]
                        if (Array.isArray(array))
                        {
                            for(let l = 0; l < array.length; l++)
                            {
                                callargs[arrIdx] = array[l]
                                if (await callSchemaFunction(exp.func, callargs))
                                    res.push(array[l])
                            }
                        }
                    }
                    break
                
                case ExpressionType.Reduce:
                    if (arrIdx >= 0)
                    {
                        const array = callargs[arrIdx]
                        if (Array.isArray(array))
                        {
                            let sumIndex = arrIdx == 1 ? 0 : 1
                            let hasInit = !isNull(callargs[sumIndex])
                            if (!hasInit) callargs[sumIndex] = array.length ? array[0] : null
                            for(let s = hasInit ? 1 : 0; s < array.length; s++)
                            {
                                callargs[arrIdx] = array[s]
                                callargs[sumIndex] = await callSchemaFunction(exp.func, callargs)
                            }
                            res = callargs[sumIndex]
                        }
                    }
                    break
            }

            if (isNull(res)) res = null
            ret[i] = res
            values[exp.name] = res

            if (Array.isArray(res) && (await getSchema(exp.return))?.type === SchemaType.Array)
            {
                arraymap[exp.name] = (await getSchema(exp.return))?.array?.element || ""
            }
        }
        else {
            ret[i] = null
        }
    }
    result.value = ret
}

const refresh = async () => {
    const retType = returnNode.rawData
    state.return = retType
    state.arglen = argsNode.elements.length
    state.explen = expsNode.elements.length

    const retSchema = retType ? await getSchema(retType) : null
    const typeMap: Map<string, INodeSchema> = new Map()

    // args refresh
    const args: { name: string, schema: INodeSchema }[] = []
    for (let i = 0; i < argsNode.elements.length; i++) {
        const a = argsNode.elements[i]
        const { name, type } = a.rawData
        if (name && type) {
            const schema = await getSchema(type)
            if (schema) {
                args.push({ name, schema })
                typeMap.set(name, schema)
            }
        }
    }

    // return check with last exp
    let lastMatch = false
    let isStructRet = retSchema?.type === SchemaType.Struct && retSchema.struct?.fields.length
    const expcount = expsNode.elements.length
    if (retSchema && expcount)
    {
        const data = expsNode.elements[expcount - 1].rawData
        lastMatch = (data.return && await isSchemaCanBeUseAs(data.return, retSchema.name)) || false
    }

    // exps refresh
    const exps: { name: string, schema: INodeSchema }[] = []
    const retColor: string[] = []
    for (let i = 0; i < expcount; i++) {
        const e = expsNode.elements[i] as StructNode
        const { name, type, func } = e.rawData
        const ret = e.rawData.return

        let funcret = ret
        let arrayType = ""
        let arrayEle = ""
        let isarray = type !== ExpressionType.Call
        let arrIdx = -1
        
        switch (type) {
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

        // may be use later
        if (arrayType && arrayEle) {}

        // args
        const fargs = e.getField("args") as ArrayNode
        const finfo = func ? await getSchema(func) : null
        const farglen = finfo?.func?.args.length || 0
        while (fargs.elements.length < farglen) fargs.addRow()
        if (fargs.elements.length > farglen) fargs.delRows(farglen, fargs.elements.length - farglen)

        const generic = finfo?.func?.generic ? (Array.isArray(finfo.func.generic) ? [...finfo.func.generic] : [ finfo.func.generic ]) : []
        if (finfo?.func?.return && /^[tT]\d*$/.test(finfo.func.return)) {
            const gidx = finfo.func.return.length > 1 ? parseInt(finfo.func.return.substring(1)) - 1 : 0
            if (ret) generic[gidx] = ret
        }

        // special func refresh trick
        const specials: ArgInfo[] = specialFuncRefresh[func]
            ? await specialFuncRefresh[func](fargs.elements as StructNode[], typeMap, ret)
            : []

        // adjust type, white list and etc
        for (let k = 0; k < farglen; k++) {
            const farg = fargs.elements[k] as StructNode
            const display = farg.getField("display") as ScalarNode
            const type = farg.getField("type") as ScalarNode
            const name = farg.getField("name") as ScalarNode
            const valueField = farg.getField("value") as ScalarNode
            const special = specials.length > k ? specials[k] : undefined

            const carg = finfo!.func!.args[k]
            display.data = `${carg.nullable ? '? ' : '* '}${special?.display || carg.name}`

            // call argument type
            let ctype = await getSchema(special?.type || carg.type, generic)
            const choose = name.rawData
            const exp = choose ? args.find(a => a.name === choose) || exps.find(a => a.name === choose) : null

            // match type and array index
            if (!ctype && /^[tT]\d*$/.test(carg.type)) {
                // confirm the generic type
                const gidx = funcret.length > 1 ? parseInt(funcret.substring(1)) - 1 : 0
                if (exp) {
                    ctype = exp.schema
                    generic[gidx] = exp.schema.name
                    if (isarray && arrIdx < 0)
                    {
                        if (exp.schema.type === SchemaType.Array && exp.schema.array?.element)
                        {
                            ctype = await getSchema(exp.schema.array.element)
                            arrIdx = k
                            generic[gidx] = ctype!.name
                        }
                    }
                }
                else if (generic[gidx]) {
                    ctype = await getSchema(generic[gidx])
                }
            }
            else if (isarray && arrIdx < 0 && exp && ctype)
            {
                if (exp.schema.type === SchemaType.Array && exp.schema.array?.element && await isSchemaCanBeUseAs(exp.schema.array.element, ctype!.name))
                {
                    arrIdx = k
                }
            }

            // type value
            type.data = ctype?.name || NS_SYSTEM_STRING

            // name white list
            const whitelist: string[] = []
            if (ctype) {
                for (let j = 0; j < args.length; j++) {
                    if (await isSchemaCanBeUseAs(args[j].schema.name, ctype.name)) {
                        whitelist.push(args[j].name)
                    }
                    else if (isarray && (arrIdx === k || arrIdx < 0) && ctype.type !== SchemaType.Array && args[j].schema.array?.element && await isSchemaCanBeUseAs(args[j].schema.array!.element, ctype.name))
                    {
                        whitelist.push(args[j].name)
                    }
                }
                for (let j = 0; j < exps.length; j++) {
                    if (await isSchemaCanBeUseAs(exps[j].schema.name, ctype.name)) {
                        whitelist.push(exps[j].name)
                    }
                    else if (isarray && (arrIdx === k || arrIdx < 0) && ctype.type !== SchemaType.Array && exps[j].schema.array?.element && await isSchemaCanBeUseAs(exps[j].schema.array!.element, ctype.name))
                    {
                        whitelist.push(exps[j].name)
                    }
                }
            }
            else {
                args.forEach(a => whitelist.push(a.name))
                exps.forEach(a => whitelist.push(a.name))
            }
            if (!isEqual((name.rule as ScalarRule).whiteList, whitelist)) {
                (name.rule as ScalarRule).whiteList = whitelist
                name.validate().then(() => name.notifyState())
            }

            // value field
            if (!isEqual(special?.whiteList, valueField.rule.whiteList))
            {
                valueField.rule.whiteList = special?.whiteList
                valueField.validate().then(() => valueField.notifyState())
            }
        }

        // save
        if (name && ret) {
            const schema = await getSchema(ret)
            if (schema) {
                exps.push({ name, schema })
                typeMap.set(name, schema)
            }
        }

        // ret check color
        if (isStructRet)
        {
            if (lastMatch)
            {
                retColor[i] = (i === expcount - 1) ? 'LIGHTBLUE' : ''
            }
            else
            {
                const fld = retSchema?.struct?.fields.find((f:any) => f.name === name)
                if (fld)
                {
                    retColor[i] = await isSchemaCanBeUseAs(ret, fld.type) ? 'LIGHTBLUE' : 'RED'
                }
                else
                {
                    retColor[i] = ''
                }
            }
        }
        else 
        {
            retColor[i] = (i === expcount - 1) ? (lastMatch ? 'LIGHTBLUE' : 'RED') : ''
        }
    }
    color.value = retColor

    // return check
    await doCaclc()
}

const soonRefresh = debounce(refresh, 50)
const delayRefresh = debounce(refresh, 1000)

const refreshArgs = async () => {
    const acolor = []
    const returnType = returnNode.data
    const schema = returnType ? await getSchema(returnType) : null

    for (let i = 0; i < argsNode.elements.length; i++) {
        const { name, type } = argsNode.elements[i].data
        if (argdatas.length > i) {
            argdatas[i].name = name
            argdatas[i].key = `${name}-${type}`
            if (type !== argdatas[i].type) {
                argdatas[i].type = type
                argdatas[i].data = null
            }
        }
        else {
            argdatas[i] = reactive({ key: `${name}-${type}`, name, type, data: null, showdata: false })
        }

        acolor[i] = ""
        if (schema?.type === SchemaType.Struct && schema.struct?.fields.length)
        {
            const fld = schema.struct.fields.find((f:any) => f.name === name)
            if (fld)
            {
                acolor[i] = await isSchemaCanBeUseAs(type, fld.type) ? 'LIGHTBLUE' : 'RED'   
            }
        }
    }
    argColor.value = acolor

    return soonRefresh()
}

const soonRefreshArgs = debounce(refreshArgs, 50)
const delayRefreshArgs = debounce(refreshArgs, 1000)

// calc
watch(argdatas, doCaclc)

interface IArgHandler { guid: string, name: Function, type: Function }
interface IExpHandler { guid: string, name: Function, return: Function, type: Function, func: Function, args: Function }
const clearArgHandler = (handler: IArgHandler | undefined) => {
    handler?.name()
    handler?.type()
}
const clearExpHandler = (handler: IExpHandler | undefined) => {
    handler?.name()
    handler?.return()
    handler?.type()
    handler?.func()
    handler?.args()
}

const argsHandlers: IArgHandler[] = []
const expsHandlers: IExpHandler[] = []

onMounted(() => {
    stateHandler = funcNode.subscribeState(() => {
        state.readonly = funcNode.readonly
    }, true)

    retHandler = returnNode.subscribe(refreshArgs)
    argsHandler = argsNode.subscribe((action: string) => {
        const arglen = argsNode.elements.length
        if (action !== "swap" && argsHandlers.length === arglen) return

        let changed = false

        // clear
        for (let i = argsHandlers.length - 1; i >= argsNode.elements.length; i--)
        {
            changed = true
            clearArgHandler(argsHandlers.pop())
        }

        // subscribe
        argsNode.elements.forEach((e:AnySchemaNode, i:number) => {
            if (argsHandlers.length > i)
            {
                if (argsHandlers[i].guid === e.guid) return
                clearArgHandler(argsHandlers[i])
            }

            changed = true
            const n = e as StructNode
            argsHandlers[i] = {
                guid: e.guid,
                name: n.getField("name").subscribe(delayRefreshArgs),
                type: n.getField("type").subscribe(refreshArgs)
            }
        })

        if (changed) return soonRefreshArgs()
    }, true)

    expsHandler = expsNode.subscribe((action: string) => {
        const expslen = expsNode.elements.length
        if (action !== "swap" && expsHandlers.length === expslen) return

        let changed = false

        // clear
        for (let i = expsHandlers.length - 1; i >= expslen; i--)
        {
            changed = true
            clearExpHandler(expsHandlers.pop())
        }

        // subscribe
        expsNode.elements.forEach((e:AnySchemaNode, i:number) => {
            if (expsHandlers.length > i)
            {
                if (expsHandlers[i].guid === e.guid) return
                clearExpHandler(expsHandlers[i])
            }

            changed = true
            const n = e as StructNode
            expsHandlers[i] = {
                guid: e.guid,
                name: n.getField("name").subscribe(delayRefresh),
                return: n.getField("return").subscribe(soonRefresh),
                type: n.getField("type").subscribe(soonRefresh),
                func: n.getField("func").subscribe(soonRefresh),
                args: n.getField("args").subscribe(delayRefresh)
            }
        })

        if (changed) return soonRefresh()
    }, true)
})

onUnmounted(() => {
    argsHandlers.forEach(clearArgHandler)
    argsHandlers.length = 0
    expsHandlers.forEach(clearExpHandler)
    expsHandlers.length = 0

    if (stateHandler) stateHandler()
    if (retHandler) retHandler()
    if (argsHandler) argsHandler()
    if (expsHandler) expsHandler()
    stateHandler = undefined
    retHandler = undefined
    argsHandler = undefined
    expsHandler = undefined
    
    clearDebounce(soonRefresh)
    clearDebounce(delayRefresh)
    clearDebounce(soonRefreshArgs)
    clearDebounce(delayRefreshArgs)
})
</script>