<template>
    <el-container>
        <svg :style="{width: state.svgWidth, height: state.svgHeight, display: 'block', 'margin-left': 'auto', 'margin-right': 'auto'}" xmlns="http://www.w3.org/2000/svg" version="1.1">
            <g v-for="(level, levelIndex) in displayLevels" :key="`level-${levelIndex}`">
                <g 
                    v-for="node in level"
                    :key="node.guid"
                >
                    <rect
                        :x="node.x" 
                        :y="node.y" 
                        :width="node.width + 14" 
                        height="40" 
                        rx="10" ry="10" 
                        fill="#f0f8ff" 
                        stroke="#4682b4" 
                        stroke-width="2"
                    />
                    
                    <!-- Node text -->
                    <text 
                        :x="node.x + (node.width) / 2" 
                        :y="node.y + 25" 
                        font-family="Arial, sans-serif" 
                        font-size="14" 
                        fill="#000000" 
                        text-anchor="middle"
                        @click="openWorkflowNode(node)"
                        class="workflow-node"
                    >
                        {{ node.display }}
                    </text>
                    <text 
                        v-if="!state.readonly"
                        :x="node.x + node.width + 4" 
                        :y="node.y + 25" 
                        font-family="Arial, sans-serif" 
                        font-size="24" 
                        fill="#ff0000" 
                        text-anchor="middle"
                        class="workflow-node"
                        @click="addWorkflowNode(node)"
                        >
                        +
                    </text>

                    <!-- Connections -->
                    <line 
                        v-for="child in node.children" 
                        :key="`line-${node.guid}-${child.guid}`"
                        :x1="node.x + (node.width + 20) / 2" 
                        :y1="node.y + 40" 
                        :x2="child.x + (child.width + 20) / 2" 
                        :y2="child.y" 
                        stroke="#4682b4" 
                        stroke-width="2"
                    ></line>
                </g>
            </g>
        </svg>
        <el-drawer v-model="showWorkflowNode" :title="workflowNodeDisplay" direction="rtl" size="80%" append-to-body @closed="closeWorkflowNode">
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <schema-view 
                        v-if="workflowNode"
                        :key="workflowNode.guid"
                        :node="workflowNode.node" 
                        in-form="expandall"
                        :plain-text="plainText"
                        no-add no-del
                        v-bind="$attrs"
                    ></schema-view>
                </el-main>
                <el-footer>
                    <el-popconfirm
                        v-if="!workflowNode?.children?.length && !state.readonly" 
                        :title="_L['frontend.view.confirmdelete']"
                        :confirm-button-text="_L['YES']"
                        :cancel-button-text="_L['NO']"
                        :icon="Delete"
                        @confirm="deleteNode"
                        style="float:right;"
                        >
                        <template #reference>
                            <el-button type="danger">
                                {{ _L["frontend.view.delete"] }}
                            </el-button>
                        </template>
                    </el-popconfirm>
                </el-footer>
            </el-container>
        </el-drawer>
    </el-container>
</template>

<script lang="ts" setup>
import { Delete } from '@element-plus/icons-vue'
import { ArrayNode, debounce, getAppSchema, getCachedSchema, getFieldAccessWhiteList, getGenericParameter, getSchema, ScalarNode, SchemaType, StructNode, WorkflowMode, type ILocaleString, type WorkflowModeValue } from 'schema-node'
import { _L, schemaView } from 'schema-node-vueview'
import { onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'

const MIN_SVG_WIDTH = 800
const BASE_HEIGHT = 15
const H_SPACING = 20
const V_SPACING = 200
const WORD_WIDTH = 16

const hexagonPoints = `60,0 120,24 120,48 60,72 0,48 0,24`
const diamondPoints = `60,0 120,24 60,48 0,24`

const props = defineProps<{ node: ArrayNode, plainText?: any, inForm?: any }>()
const arrayNode = toRaw(props.node)
const state = reactive({
    readonly: false,
    length: 0,
    svgWidth: MIN_SVG_WIDTH,
    svgHeight: BASE_HEIGHT,
})

const appworkflow = arrayNode.parent as StructNode
const app = appworkflow.getField("app")!.data as string // always exist

interface IWorkflowNode {
    guid: string,
    mode: WorkflowModeValue | undefined,
    type: 'start' | 'end' | undefined,
    name: string,
    index: number,
    display: string,
    children: IWorkflowNode[],
    node: StructNode,
    previous: string[],
    depth: number, // for layout
    x: number,
    y: number,
    width: number,
}
const displayLevels = ref<IWorkflowNode[][]>([])
let payloadTypes:{ name: string, display?: ILocaleString, type: string }[] = []

const getTextWidth = (text: string) =>
{
    text ??= ""
    const length = text.length
    const nonWrodLength = text.replace(/\w+/g, "").length
    return Math.floor(nonWrodLength * WORD_WIDTH + (length - nonWrodLength) * WORD_WIDTH / 2)
}

// Workflow -> SVG nodes
const refreshWorkflows = async () => {
    const appSchema = await getAppSchema(app)
    if (!appSchema) return

    const payloads:{ name: string, display?: ILocaleString, type: string }[] = []
    const nodes: IWorkflowNode[] = []
    let maxDepth: number = 0

    const getParent = (nodes: IWorkflowNode[], name: string): IWorkflowNode | undefined =>
    {
        for(const n of nodes)
        {
            if (n.name === name) return n
            const p = getParent(n.children, name)
            if (p) return p
        }
        return undefined
    }

    for(let i = 0; i< arrayNode.elements.length; i++)
    {
        const n = arrayNode.elements[i] as StructNode
        const { name, type, display, previous, payload } = n.data
        const workflowType = type ? await getSchema(type) : undefined

        const wfNode: IWorkflowNode = {
            guid: n.guid,
            index: i,
            mode: workflowType?.workflow?.mode,
            type: previous && Array.isArray(previous) && previous.length ? 'end' : 'start',
            name: name || '',
            display: _L.value(display?.key ? display : name) || name,
            node: n,
            children: [],
            previous: previous && Array.isArray(previous) ? previous : [],
            depth: 0, x: 0, y: 0,
            width: 0
        }
        wfNode.width = getTextWidth(wfNode.display)

        if (name && payload) payloads.push({ name, type: payload, display })

        if (previous && Array.isArray(previous) && previous.length)
        {
            previous.forEach((p: string) => {
                const parentNode = getParent(nodes, p)
                if (parentNode)
                {
                    if (parentNode.type === 'end')
                        parentNode.type = undefined
                    wfNode.depth = Math.max(parentNode.depth + 1, wfNode.depth)
                    parentNode.children.push(wfNode)
                }
            })
        }
        else
        {
            nodes.push(wfNode)
        }
        maxDepth = Math.max(wfNode.depth, maxDepth)
    }

    // build display levels
    const levels: IWorkflowNode[][] = [nodes]
    for(let d = 1; d <= maxDepth; d++)
    {
        const levelNodes: IWorkflowNode[] = []
        levels[d - 1].forEach(n => {
            if (n.children.length) {
                n.children.forEach(cn => {
                    if (levelNodes.includes(cn)) return
                    levelNodes.push(cn)
                })
                if (n.children.length === 1)
                {
                    n.children[0].width = Math.max(n.width, n.children[0].width)
                }
            } else
                levelNodes.push(n) // keep the node in the level for alignment
        })
        levels.push(levelNodes)
    }

    // calc the x, y
    const maxWdith = levels[maxDepth].reduce((pre, cur) => pre + cur.width, 0) + (levels[maxDepth].length - 1) * H_SPACING
    state.svgWidth = Math.max(MIN_SVG_WIDTH, maxWdith)
    state.svgHeight = BASE_HEIGHT + (maxDepth + 1) * V_SPACING
    
    // calc the last level
    let lastY = BASE_HEIGHT + maxDepth * V_SPACING
    let offsetX = (state.svgWidth - maxWdith) / 2
    levels[maxDepth].forEach(n => {
        n.x = offsetX
        n.y = lastY
        offsetX += n.width + H_SPACING
    })

    // calc other levels
    for(let d = maxDepth - 1; d >= 0; d--)
    {
        const levelNodes = levels[d]
        lastY -= V_SPACING
        levelNodes.forEach(n => {
            n.y = lastY
            const selfOnlyChildren = n.children.filter(c => c.previous.length === 1)
            if (selfOnlyChildren.length)
                n.x = selfOnlyChildren.reduce((pre, cur) => pre + cur.x + cur.width / 2, 0) / selfOnlyChildren.length - n.width / 2
            else if(n.children.length)
                n.x = n.children[0].x + n.children[0].width / 2 - n.width / 2
        })
        levelNodes.sort((a, b) => a.x - b.x)
    }

    displayLevels.value = levels
    payloadTypes = payloads
}

// workflow node drawer
const showWorkflowNode = ref(false)
const workflowNodeDisplay = ref("")
const workflowNode = ref<IWorkflowNode | null>(null)

interface IWorkflowHandler { name: Function, type: Function, args: Function, func: Function, funcArgs: Function, event: Function, payload: Function }
const clearWorkflowHandler = (h: IWorkflowHandler | undefined) => {
    h?.name()
    h?.type()
    h?.args()
    h?.func()
    h?.funcArgs()
    h?.event()
    h?.payload()
}
let refreshHandler: IWorkflowHandler | undefined = undefined

const getAllPrevious = (prevs: any): string[] => {
    if (prevs && Array.isArray(prevs)) 
    {
        const result = [...prevs]
        prevs.forEach((p: string) => {
            const node = arrayNode.elements.find(e => (e as StructNode).data.name === p) as StructNode | undefined
            if (node)
            {
                const { previous } = node.data
                if (previous && Array.isArray(previous))
                {
                    const pprevs = getAllPrevious(previous)
                    pprevs.forEach(pp => {
                        if (result.indexOf(pp) < 0) result.push(pp)
                    })
                }
            }
        })
        return result
    }
    return []
}

const spacialFuncHandlers: { [key: string]: Function } = {
    "system.data.getappdatabyonekey": async (args: ArrayNode, payloadTypes: any) => {
        if (args.elements.length < 3) return []
        const app = (args.elements[0] as StructNode).getField("value")?.data as string
        const field = (args.elements[1] as StructNode).getField("value")?.data as string
        const firstKey = args.elements[2] as StructNode

        const appSchema = app ? await getAppSchema(app) : null
        if (!appSchema) return []
        
        const fieldSchema = appSchema.fields?.find(f => f.name === field)
        if (!fieldSchema) return []
        
        const fieldType = await getSchema(fieldSchema.type)
        if (fieldType?.type === SchemaType.Array && fieldType.array?.primary?.length === 1)
        {
            const eleType = await getSchema(fieldType.array.element)
            if (eleType?.type === SchemaType.Struct && eleType.struct?.fields)
            {
                const pkField = eleType.struct.fields.find(f => f.name === fieldType.array!.primary![0])
                if (pkField)
                {
                    const display = firstKey.getField("display")!
                    const type = firstKey.getField("type")!
                    const nameField = firstKey.getField("name") as ScalarNode

                    display.data = `* ${pkField.display?.key ? _L.value(pkField.display) : pkField.name}`
                    type.data = pkField.type

                    nameField.rule.whiteList = await getFieldAccessWhiteList(pkField.type, payloadTypes)
                    nameField.validation().then(() => nameField.notifyState())
                }
            }
        }
    },
    "system.data.saveappdata": async (args: ArrayNode, payloadTypes: any) => {
        if (args.elements.length < 3) return []
        const app = (args.elements[0] as StructNode).getField("value")?.data as string
        const field = (args.elements[1] as StructNode).getField("value")?.data as string
        const data = args.elements[2] as StructNode

        const appSchema = app ? await getAppSchema(app) : null
        if (!appSchema) return []
        
        const fieldSchema = appSchema.fields?.find(f => f.name === field)
        if (!fieldSchema) return []
        
        const display = data.getField("display")!
        const type = data.getField("type")!
        const nameField = data.getField("name") as ScalarNode

        display.data = `* ${fieldSchema.display?.key ? _L.value(fieldSchema.display) : fieldSchema.name}`
        type.data = fieldSchema.type

        nameField.rule.whiteList = await getFieldAccessWhiteList(fieldSchema.type, payloadTypes)
        nameField.validation().then(() => nameField.notifyState())
    }
}

const refreshWorkflowNode = async() => {
    const appSchema = await getAppSchema(app)
    if (!appSchema) return

    const node = workflowNode.value?.node
    if (!node) return

    const { name, type, args, previous } = node.data
    
    // for payload and args
    if (!type) return

    const prevs = getAllPrevious(previous)
    const payloads = payloadTypes.filter(p => prevs.indexOf(p.name) >= 0)

    const payloadField = node.getField("payload") as ScalarNode
    const funcArgsField = node.getField("funcArgs") as ArrayNode

    let enablePayloadInput = false // If we can't determine payload type
    let noPayload = false
    const workflowType = getCachedSchema(type)
    if (workflowType?.type !== SchemaType.Workflow) return

    if(workflowType.workflow?.mode === WorkflowMode.Function)
    {
        // function workflow
        const func = node.getField("func")?.data as string
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
                const payload = payloadField.data as string
                if (payload){
                    const gidx = funcSchema.func?.return && funcSchema.func.return.length > 1 ? parseInt(funcSchema.func.return.substring(1)) - 1 : 0
                    generic[gidx] = payload
                }
            }


            // adjust arguments
            for (let j = 0; j < len; j++){
                const carg = funcSchema.func!.args![j]
                const farg = funcArgsField.elements[j] as StructNode
                const display = farg.getField("display")!
                const type = farg.getField("type")!
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

                nameField.rule.whiteList = await getFieldAccessWhiteList(ctype, payloads)
                nameField.validation().then(() => nameField.notifyState())
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
    const argsField = node.getField("args") as ArrayNode
    if (workflowType.workflow?.args?.length){
        const len = workflowType.workflow.args.length
        while (argsField.elements.length < len) argsField.addRow()
        if (argsField.elements.length > len) argsField.delRows(len, argsField.elements.length - len)
    
        for (let j = 0; j < len; j++){
            const carg = workflowType.workflow.args[j]
            const farg = argsField.elements[j] as StructNode
            const display = farg.getField("display")!
            const type = farg.getField("type")!
            const nameField = farg.getField("name") as ScalarNode

            display.data = `${carg.nullable ? '? ' : '* '}${carg.name}`
            type.data = carg.type
            if (carg.type === "system.schema.appfield")
                nameField.rule.whiteList = undefined
            else
                nameField.rule.whiteList = await getFieldAccessWhiteList(carg.type, payloadTypes)
            nameField.validation().then(() => nameField.notifyState())
        }
    }
    else
    {
        argsField.data = [] // clear args
    }
}

const soonRefresh = debounce(refreshWorkflowNode, 50)

const openWorkflowNode = async (node: IWorkflowNode) => {
    clearWorkflowHandler(refreshHandler)
    const n = node.node
    refreshHandler = {
        name: n.getField("name")!.subscribe(() => soonRefresh("name")),
        type: n.getField("type")!.subscribe(() => soonRefresh("type")),
        args: n.getField("args")!.subscribe(() => soonRefresh("args")),
        func: n.getField("func")!.subscribe(() => soonRefresh("func")),
        funcArgs: n.getField("funcArgs")!.subscribe(() => soonRefresh("funcArgs")),
        event: n.getField("event")!.subscribe(() => soonRefresh("event")),
        payload: n.getField("payload")!.subscribe(() => soonRefresh("payload"))
    }

    workflowNode.value = node
    await refreshWorkflowNode()
    showWorkflowNode.value = true
}

const closeWorkflowNode = () => {
    workflowNode.value = null
    clearWorkflowHandler(refreshHandler)
    refreshHandler = undefined
    refreshWorkflowNode()
}

const addWorkflowNode = async (parentNode: IWorkflowNode) => {
    if (state.readonly) return

    const newNode = arrayNode.addRow() as StructNode
    newNode.data = {
        name: `${parentNode.name}_child${parentNode.children.length + 1}`,
        type: "",
        previous: [ parentNode.name ],
        args: [],
        funcArgs: []
    }
    await refreshWorkflows()
    
    const addedNode = displayLevels.value.flat().find(n => n.guid === newNode.guid)
    if (addedNode)
       await openWorkflowNode(addedNode)
}

const deleteNode = () => {
    const node = workflowNode.value?.node
    if (!node) return

    const index = arrayNode.elements.findIndex(e => (e as StructNode).guid === node.guid)
    if (index < 0) return

    showWorkflowNode.value = false
    arrayNode.delRows(index)
    closeWorkflowNode()
}

let handler: Function | undefined = arrayNode.subscribe((action:string) => {
    const len = arrayNode.elements.length
    if (action !== "swap" && len == state.length) return;

    // refresh if changed
    return refreshWorkflows()
}, true)

let stateHandler: Function | undefined = arrayNode.subscribeState(() => {
    state.readonly = arrayNode.readonly || false
}, true)

onMounted(() => {
    if (!arrayNode.elements.length && !state.readonly)
    {
        // add initial node
        const newNode = arrayNode.addRow() as StructNode
        newNode.data = {
            name: `start`,
            type: "",
            previous: [],
            args: [],
            funcArgs: []
        }
    }
})

onUnmounted(() => {
    if (handler) handler()
    if (stateHandler) stateHandler()
    handler = undefined
    stateHandler = undefined
    clearWorkflowHandler(refreshHandler)
    refreshHandler = undefined
})
</script>

<style scoped>
.workflow-svg {
  background: #fafafa;
}

.workflow-node {
  cursor: pointer;
}

.node-text {
  font-size: 12px;
  fill: #303133;
  pointer-events: none;
}
</style>
