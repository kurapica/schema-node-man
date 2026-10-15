<template>
    <el-container>
        <svg :style="{ width: state.svgWidth, height: state.svgHeight, display: 'block', 'margin-left': 'auto', 'margin-right': 'auto' }"
            xmlns="http://www.w3.org/2000/svg" version="1.1">
            <g v-for="(level, levelIndex) in displayLevels" :key="`level-${levelIndex}`">
                <g v-for="node in level" :key="node.guid">
                    <rect :x="node.x" :y="node.y" :width="node.width + 14" height="40" rx="10" ry="10" fill="#f0f8ff"
                        stroke="#4682b4" stroke-width="2" />

                    <!-- Node text -->
                    <text :x="node.x + (node.width) / 2" :y="node.y + 25" font-family="Arial, sans-serif" font-size="14"
                        fill="#000000" text-anchor="middle" @click="openWorkflowNode(node as any)"
                        class="workflow-node">
                        {{ node.display || "Anonymous" }}
                    </text>
                    <text v-if="!state.readonly" :x="node.x + node.width + 4" :y="node.y + 25"
                        font-family="Arial, sans-serif" font-size="24" fill="#ff0000" text-anchor="middle"
                        class="workflow-node" @click="addWorkflowNode(node as any)">
                        +
                    </text>

                    <!-- Connections -->
                    <line v-for="child in node.children" :key="`line-${node.guid}-${child.guid}`"
                        :x1="node.x + (node.width + 20) / 2" :y1="node.y + 40" :x2="child.x + (child.width + 20) / 2"
                        :y2="child.y" stroke="#4682b4" stroke-width="2"></line>
                </g>
            </g>
        </svg>
        <el-drawer v-model="showWorkflowNode" :title="workflowNodeDisplay" direction="rtl" size="80%" append-to-body
            @close="closeWorkflowNode">
            <el-container class="main" style="height: 80vh;">
                <el-main>
                    <schema-view v-if="workflowNode" :key="workflowNode.guid" :node="workflowNode.node as any"
                        :in-form="SchemaNodeFormType.ExpandAll" :text="plainText" no-add no-del v-bind="$attrs"></schema-view>
                </el-main>
                <el-footer>
                    <el-popconfirm v-if="!workflowNode?.children?.length && !state.readonly"
                        :title="_L['frontend.view.confirmdelete']" :confirm-button-text="_L['YES']"
                        :cancel-button-text="_L['NO']" :icon="Delete" @confirm="deleteNode" style="float:right;">
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
import { WorkflowType, WorkflowNode } from 'schema-node-app'
import { Delete } from '@element-plus/icons-vue'
import { ArrayNode, getNodeType, LocaleString, ReadOnly, StructNode } from 'schema-node-core'
import { _L, SchemaNodeFormType, schemaView, subscribeAncestorProperty } from 'schema-node-vue-view'
import { onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'

const MIN_SVG_WIDTH = 800
const BASE_HEIGHT = 15
const H_SPACING = 20
const V_SPACING = 200
const WORD_WIDTH = 16
const MIN_WORD_WIDTH = 60

//const hexagonPoints = `60,0 120,24 120,48 60,72 0,48 0,24`
//const diamondPoints = `60,0 120,24 60,48 0,24`

const props = defineProps<{ node: ArrayNode, plainText?: any, inForm?: any }>()
const arrayNode = toRaw(props.node)
const state = reactive({
    readonly: false,
    length: 0,
    svgWidth: MIN_SVG_WIDTH,
    svgHeight: BASE_HEIGHT,
})

interface IWorkflowNode {
    guid: string,
    kind: string | undefined,
    type: 'start' | 'end' | undefined,
    name: string,
    index: number,
    display: string,
    children: IWorkflowNode[],
    node: WorkflowNode,
    previous: string[],
    depth: number, // for layout
    x: number,
    y: number,
    width: number,
}
const displayLevels = ref<IWorkflowNode[][]>([])
let payloadTypes: { name: string, display?: LocaleString, type: string }[] = []

const getTextWidth = (text: string) => {
    text ??= ""
    const length = text.length
    const nonWrodLength = text.replace(/\w+/g, "").length
    return Math.max(MIN_WORD_WIDTH, Math.floor(nonWrodLength * WORD_WIDTH + (length - nonWrodLength) * WORD_WIDTH / 2))
}

// Workflow -> SVG nodes
const refreshWorkflows = async () => {
    const payloads: { name: string, display?: LocaleString, type: string }[] = []
    const nodes: IWorkflowNode[] = []
    let maxDepth: number = 0

    const getParent = (nodes: IWorkflowNode[], name: string): IWorkflowNode | undefined => {
        for (const n of nodes) {
            if (n.name === name) return n
            const p = getParent(n.children, name)
            if (p) return p
        }
        return undefined
    }
    
    for (let i = 0; i < arrayNode.length; i++) {
        const n = arrayNode.at(i) as WorkflowNode
        const { name, type, display, previous, payload } = n.rawValue as any
        const workflowType = type ? await getNodeType(type) as WorkflowType : undefined

        const wfNode: IWorkflowNode = {
            guid: n.id,
            index: i,
            kind: workflowType?.workflowKind,
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

        if (previous && Array.isArray(previous) && previous.length) {
            let parentWidths = 0
            let hasParent = false
            previous.forEach((p: string) => {
                const parentNode = getParent(nodes, p)
                if (parentNode) {
                    hasParent = true
                    if (parentNode.type === 'end')
                        parentNode.type = undefined
                    wfNode.depth = Math.max(parentNode.depth + 1, wfNode.depth)
                    parentNode.children.push(wfNode)
                    if (parentNode.previous.length <= 1)
                        parentWidths += parentNode.width
                }
            })
            if (!hasParent) {
                nodes.push(wfNode)
            }
            // adjust width for parent nodes
            wfNode.width = Math.max(wfNode.width, parentWidths + (previous.length - 1) * H_SPACING)
        }
        else {
            nodes.push(wfNode)
        }
        maxDepth = Math.max(wfNode.depth, maxDepth)
    }

    // build display levels
    const levels: IWorkflowNode[][] = [nodes]
    for (let d = 1; d <= maxDepth; d++) {
        const levelNodes: IWorkflowNode[] = []
        levels[d - 1].forEach(n => {
            if (n.children.length) {
                n.children.forEach(cn => {
                    if (levelNodes.includes(cn)) return
                    levelNodes.push(cn)
                })
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
    for (let d = maxDepth - 1; d >= 0; d--) {
        const levelNodes = levels[d]
        lastY -= V_SPACING
        const childPos: { [key: string]: number } = {}
        levelNodes.forEach(n => {
            n.y = lastY
            if (!n.children.length) return // keep the x for single node

            const centers: { begin: number, end: number }[] = n.children.map(c => {
                if (c.previous.length === 1) return { begin: c.x, end: c.x + c.width }
                const begin = childPos[c.guid] || c.x
                const end = begin + n.width
                childPos[c.guid] = end + H_SPACING
                return { begin, end }
            })
            n.x = Math.min(...centers.map(c => c.begin)) + (Math.max(...centers.map(c => c.end)) - Math.min(...centers.map(c => c.begin))) / 2 - n.width / 2
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

const openWorkflowNode = async (node: IWorkflowNode) => {
    const n = node.node
    workflowNode.value = node
    showWorkflowNode.value = true
}

const closeWorkflowNode = () => {
    workflowNode.value = null
    showWorkflowNode.value = false
    refreshWorkflows()
}

const addWorkflowNode = async (parentNode: IWorkflowNode) => {
    if (state.readonly) return

    const index = arrayNode.indexOf(parentNode.node)
    const newNode = arrayNode.addRow() as StructNode
    newNode.value = {
        name: `${parentNode.name}_child${parentNode.children.length + 1}`,
        previous: [parentNode.name],
    }
    await refreshWorkflows()

    const addedNode = displayLevels.value.flat().find(n => n.guid === newNode.id)
    if (addedNode)
        await openWorkflowNode(addedNode as any)
}

const deleteNode = () => {
    const node = workflowNode.value?.node
    if (!node) return

    const index = arrayNode.indexOf(node as WorkflowNode)
    if (index < 0) return

    showWorkflowNode.value = false
    arrayNode.delRows(index)
    closeWorkflowNode()
    refreshWorkflows()
}

let stateHandler: Function | undefined =  subscribeAncestorProperty(arrayNode, ReadOnly, (values: boolean[]) => state.readonly = values.some(v => v), true)

onMounted(() => {
    if (!arrayNode.length && !state.readonly) {
        // add initial node
        const newNode = arrayNode.addRow() as StructNode
        newNode.value = {
            name: `start`
        }
    }
    refreshWorkflows();
})

onUnmounted(() => {
    if (stateHandler) stateHandler()
    stateHandler = undefined
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
