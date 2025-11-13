<template>
    <section style="width:98%;">
        <section style="width:100%;border:1px solid #dcdfe6;border-radius:4px; padding: 1rem; margin-bottom: 1rem;" v-for="i in state.length">
            <el-button v-if="!state.readonly" type="danger" @click="arrayNode.delRows(i - 1)" style="float:right;margin-left: 1rem;">{{ _L["DEL"] }}</el-button>
            <schema-view
                v-if="node.elements[i-1]"
                :key="node.elements[i-1].guid"
                :node="node.elements[i-1]"
                in-form="expandall"
                :plain-text="plainText"
                no-add no-del
                v-bind="$attrs"
            ></schema-view>
        </section>
        <el-button v-if="!state.readonly" type="success" @click="arrayNode.addRow()">{{ _L["ADD"] }}</el-button>
    </section>
</template>

<script lang="ts" setup>
import { ArrayNode, clearDebounce, debounce, getAppSchema, getCachedSchema, getFieldAccessWhiteList, getGenericParameter, getSchema, ScalarNode, SchemaType, StructNode, WorkflowMode, type ILocaleString } from 'schema-node'
import { _L, schemaView } from 'schema-node-vueview'
import { onUnmounted, reactive, toRaw } from 'vue'

const props = defineProps<{ node: ArrayNode, plainText?: any, inForm?: any }>()
const arrayNode = toRaw(props.node)
const state = reactive({
    readonly: false,
    length: 0
})

const appworkflow = arrayNode.parent as StructNode
const app = appworkflow.getField("app").data as string // always exist

// workflow data watcher
interface IWorkflowHandler { guid: string, name: Function, type: Function, args: Function, func: Function, funcArgs: Function, event: Function, payload: Function }
const clearWorkflowHandler = (h: IWorkflowHandler | undefined) => {
    h?.name()
    h?.type()
    h?.args()
    h?.func()
    h?.funcArgs()
    h?.event()
    h?.payload()
}
const workflowHandlers: IWorkflowHandler[] = []

const spacialFuncHandlers: { [key: string]: Function } = {
    "system.data.getappdatabyonekey": async (args: ArrayNode, payloadTypes: any) => {
        if (args.elements.length < 3) return []
        const app = (args.elements[0] as StructNode).getField("value").submitData as string
        const field = (args.elements[1] as StructNode).getField("value").submitData as string
        const firstKey = args.elements[2] as StructNode

        console.log("step 1")
        const appSchema = app ? await getAppSchema(app) : null
        if (!appSchema) return []
        console.log("step 2")
        const fieldSchema = appSchema.fields?.find(f => f.name === field)
        if (!fieldSchema) return []
        
        console.log("step 3")
        const fieldType = await getSchema(fieldSchema.type)
        if (fieldType?.type === SchemaType.Array && fieldType.array?.primary?.length === 1)
        {
        console.log("step 4")
            const eleType = await getSchema(fieldType.array.element)
            if (eleType?.type === SchemaType.Struct && eleType.struct?.fields)
            {
        console.log("step 5")
                const pkField = eleType.struct.fields.find(f => f.name === fieldType.array!.primary![0])
                if (pkField)
                {
        console.log("step 6")
                    const display = firstKey.getField("display")
                    const type = firstKey.getField("type")
                    const nameField = firstKey.getField("name") as ScalarNode

                    display.data = `* ${pkField.display?.key ? _L.value(pkField.display) : pkField.name}`
                    type.data = pkField.type

                    nameField.rule.whiteList = await getFieldAccessWhiteList(pkField.type, payloadTypes)
                    nameField.notifyState()
                }
            }
        }
    }
}

const refreshWorkflows = async (from: string) => {
    console.log(`Refresh workflows triggered by ${from}`)
    const appSchema = await getAppSchema(app)
    if (!appSchema) return

    const payloadTypes:{ name: string, display?: ILocaleString, type: string }[] = []
    const names: string[] = []

    for (let i = 0; i < arrayNode.elements.length; i++) {
        const n = arrayNode.elements[i] as StructNode
        const { name, type, args } = n.submitData

        // for previous
        const previous = n.getField("previous") as ArrayNode
        if (names.length > 0 && !previous.submitData?.length)
        {
            previous.data = [names[names.length - 1]]
        }

        if (name) names.push(name)
        
        // for payload and args
        if (!type) continue

        const payloadField = n.getField("payload") as ScalarNode
        const funcArgsField = n.getField("funcArgs") as ArrayNode

        let enablePayloadInput = false // If we can't determine payload type
        let noPayload = false
        const workflowType = getCachedSchema(type)
        if (workflowType?.type !== SchemaType.Workflow) continue

        if(workflowType.workflow?.mode === WorkflowMode.Function)
        {
            // function workflow
            const func = n.getField("func").submitData as string
            const funcSchema = func ? await getSchema(func) : undefined
            if (funcSchema?.type === SchemaType.Func)
            {
                const len = funcSchema.func?.args?.length || 0
                while (funcArgsField.elements.length < len) funcArgsField.addRow()
                if (funcArgsField.elements.length > len) funcArgsField.delRows(len, funcArgsField.elements.length - len)

                // check return
                const generic = funcSchema?.func?.generic ? (Array.isArray(funcSchema.func.generic) ? [...funcSchema.func.generic] : [ funcSchema.func.generic ]) : []
                if (funcSchema.func?.return && !/^[tT]\d*$/.test(funcSchema.func?.return))
                {
                    payloadField.data = funcSchema.func?.return
                }
                else 
                {
                    // enable payload input for generic return type
                    enablePayloadInput = true
                    const payload = payloadField.submitData as string
                    if (payload){
                        const gidx = funcSchema.func?.return && funcSchema.func.return.length > 1 ? parseInt(funcSchema.func.return.substring(1)) - 1 : 0
                        generic[gidx] = payload
                    }
                }

                // adjust arguments
                for (let j = 0; j < len; j++){
                    const carg = funcSchema.func!.args![j]
                    const farg = funcArgsField.elements[j] as StructNode
                    const display = farg.getField("display")
                    const type = farg.getField("type")
                    const nameField = farg.getField("name") as ScalarNode
                    let ctype = carg.type

                    if (/^[tT]\d*$/.test(ctype)){
                        // generic type
                        const gidx = ctype.length > 1 ? parseInt(ctype.substring(1)) - 1 : 0
                        if (generic.length > gidx){
                            ctype = generic[gidx]
                        }
                    }

                    display.data = `${carg.nullable ? '? ' : '* '}${carg.name}`
                    type.data = ctype

                    nameField.rule.whiteList = await getFieldAccessWhiteList(ctype, payloadTypes)
                    nameField.notifyState()
                }

                if (spacialFuncHandlers[func])
                {
                    await spacialFuncHandlers[func](funcArgsField, payloadTypes)
                }
            }
            else
            {
                funcArgsField.data = [] // clear func args
            }
        }
        else 
        {
            funcArgsField.data = [] // clear func args

            if (workflowType.workflow?.mode === WorkflowMode.Event)
            {
                // event workflow
                if (workflowType.workflow.payload){
                    const generics = getGenericParameter(workflowType.workflow.payload)
                    if (generics?.length){
                        // app event only for now
                        enablePayloadInput = true

                        if (generics?.length === 1){
                            const index = workflowType.workflow.args 
                                ? workflowType.workflow.args.findIndex(a => a.type === "system.schema.appfield")
                                : -1

                            if (index >= 0 && args && args[index] && args[index].value)
                            {
                                const field = appSchema.fields?.find(f => f.name === args[index].value)
                                if (field?.type)
                                {
                                    let payloadType = field.type
                                    const ftypeSchema = await getSchema(payloadType)
                                    if (ftypeSchema?.type === SchemaType.Array) payloadType = ftypeSchema.array!.element
                                    payloadType = `${workflowType.workflow.payload}<${payloadType}>`
                                    payloadField.data = payloadType
                                    enablePayloadInput = false
                                }
                            }
                        }
                        if (enablePayloadInput)
                            payloadField.data = workflowType.workflow.payload
                    }
                    else
                    {
                        payloadField.data = workflowType.workflow.payload
                    }
                }
            }
            else
            {
                // normal workflow
                if (workflowType.workflow?.payload && !/^[tT]\d*$/.test(workflowType.workflow.payload)){
                    payloadField.data = workflowType.workflow.payload
                }
                else if (workflowType.workflow?.payload)
                {
                    enablePayloadInput = true
                }
                else
                {
                    noPayload = true
                }
            }
        }

        // enable or disable payload input
        if (enablePayloadInput)
        {
            if (payloadField.rule.disable)
            {
                payloadField.rule.disable = false
                payloadField.notifyState()
            }
        }
        else if(!payloadField.rule.disable)
        {
            payloadField.rule.disable = true
            payloadField.notifyState()
        }

        if (noPayload)
        {
            payloadField.rule.invisible = true
            payloadField.notifyState()
        }
        else if (payloadField.rule.invisible)
        {
            payloadField.rule.invisible = false
            payloadField.notifyState()
        }

        // args field
        const argsField = n.getField("args") as ArrayNode
        if (workflowType.workflow?.args?.length){
            const len = workflowType.workflow.args.length
            while (argsField.elements.length < len) argsField.addRow()
            if (argsField.elements.length > len) argsField.delRows(len, argsField.elements.length - len)
        
            for (let j = 0; j < len; j++){
                const carg = workflowType.workflow.args[j]
                const farg = argsField.elements[j] as StructNode
                const display = farg.getField("display")
                const type = farg.getField("type")
                const nameField = farg.getField("name") as ScalarNode

                display.data = `${carg.nullable ? '? ' : '* '}${carg.name}`
                type.data = carg.type
                if (carg.type === "system.schema.appfield")
                {
                    nameField.rule.whiteList = undefined
                }
                else
                {
                    nameField.rule.whiteList = await getFieldAccessWhiteList(carg.type, payloadTypes)
                }
                nameField.notifyState()
            }
        }
        else
        {
            argsField.data = [] // clear args
        }

        // collect payload types
        if (name && payloadField.submitData)
        {
            payloadTypes.push({ name: name as string, display: n.getField("display").data as ILocaleString, type: payloadField.submitData as string })
        }
    }
}

const soonRefresh = debounce(refreshWorkflows, 50)
const delayRefresh = debounce(refreshWorkflows, 1000)

let handler: Function | undefined = arrayNode.subscribe((action:string) => {
    const len = arrayNode.elements.length
    if (action !== "swap" && len == state.length) return;

    let changed = false
    state.length = arrayNode.elements.length

    // clear
    for (let i = workflowHandlers.length - 1; i >= len; i--) {
        clearWorkflowHandler(workflowHandlers.pop())
    }

    // subscribe
    arrayNode.elements.forEach((e, i) => {
        if (workflowHandlers.length > i) {
            if (workflowHandlers[i].guid === e.guid) return
            clearWorkflowHandler(workflowHandlers[i])
        }

        changed = true
        const n = e as StructNode
        workflowHandlers[i] = {
            guid: e.guid,
            name: n.getField("name").subscribe(() => soonRefresh("name")),
            type: n.getField("type").subscribe(() => soonRefresh("type")),
            args: n.getField("args").subscribe(() => soonRefresh("args")),
            func: n.getField("func").subscribe(() => soonRefresh("func")),
            funcArgs: n.getField("funcArgs").subscribe(() => soonRefresh("funcArgs")),
            event: n.getField("event").subscribe(() => soonRefresh("event")),
            payload: n.getField("payload").subscribe(() => soonRefresh("payload"))
        }
    })

    // refresh if changed
    if (changed) return soonRefresh()
}, true)

let stateHandler: Function | undefined = arrayNode.subscribeState(() => {
    state.readonly = arrayNode.readonly || false
}, true)

onUnmounted(() => {
    workflowHandlers.forEach(clearWorkflowHandler)
    workflowHandlers.length = 0

    if (handler) handler()
    if (stateHandler) stateHandler()
    handler = undefined
    stateHandler = undefined
    clearDebounce(soonRefresh)
    clearDebounce(delayRefresh)
})
</script>