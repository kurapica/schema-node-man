<template>
    <el-container>
        <el-tabs v-if="sourceAppNode" v-model="activeTargetTab" style="margin-bottom: 1rem;">
            <el-tab-pane :label="_L['frontend.view.apptarget']" :name="0"></el-tab-pane>
            <el-tab-pane :label="_L['frontend.view.sourceapptar']" :name="1"></el-tab-pane>
        </el-tabs>
        <el-header>
            <el-form v-if="enableAppData && appTargetNode" ref="form" label-width="140px" label-position="left" :model="appTargetNode.rawData">
                <template v-if="activeTargetTab == 0">
                    <section style="float:right;margin-left: 1rem;">
                        <el-button type="info" @click="useempty">{{ _L["frontend.view.useempty"] }}</el-button>
                        <el-button type="info" @click="genguid">{{ _L["frontend.view.genguid"] }}</el-button>
                        <el-button type="primary" v-if="!saving" v-loading="loading" @click="loadData">{{ _L["frontend.view.loaddata"] }}</el-button>
                        <el-button type="warning" v-if="!loading" v-loading="loading" @click="saveData">{{ _L["frontend.view.savedata"] }}</el-button>
                    </section>
                    <schema-view
                        :node="(appTargetNode as StructNode)" 
                        :in-form="true" 
                        plain-text="left">
                    </schema-view>
                </template>

                <template v-else>
                    <section style="float:right;margin-left: 1rem;">
                        <el-button type="info" @click="gensourceguid">{{ _L["frontend.view.genguid"] }}</el-button>
                        <el-button type="primary" v-if="!saving" v-loading="loading" @click="loadSourceTarget">{{ _L["frontend.view.loadappsource"] }}</el-button>
                        <el-button type="warning" v-if="!loading" v-loading="loading" @click="saveSourceTarget">{{ _L["frontend.view.saveappsource"] }}</el-button>
                    </section>
                    <schema-view
                        :node="(sourceAppNode as StructNode)" 
                        :in-form="true" 
                        plain-text="left">
                    </schema-view>
                </template>
            </el-form>
        </el-header>
        <el-main v-if="appNode" style="max-height: 55vh;margin-top:4rem;">
            <!-- manual workflow-->
            <template v-if="manualWorkflows.length">
                <el-button v-for="wf in manualWorkflows" :key="wf.workflow" v-loading="startWorkflowing" style="margin-bottom: 1rem; margin-right: 1rem;" type="primary" @click="startWorkflow(wf.workflow)">
                    {{ _L(wf.display) || wf.workflow }}
                </el-button>
            </template>
            <el-tabs v-model="activeTab" v-if="showref || showoutput">
                <el-tab-pane :label="_L['frontend.view.inputfield']" :name="0"></el-tab-pane>
                <el-tab-pane v-if="showref" :label="_L['frontend.view.reffield']" :name="1"></el-tab-pane>
                <el-tab-pane v-if="showoutput" :label="_L['frontend.view.outputfield']" :name="2"></el-tab-pane>
            </el-tabs>

            <el-form v-show="activeTab === 0" ref="form" label-width="140px" :model="appNode.rawData">
                <template v-for="f in appNode.inputFields" :key="f.guid">
                    <h2 v-if="!invisibleFields[f.name]">{{ _L(f.display) || f.name }}</h2>
                    <schema-view
                        plain-text="left"
                        :node="(f as AnySchemaNode)"
                        :in-form="true"
                        :skin="skin"
                    ></schema-view>
                </template>
            </el-form>

            <el-form v-show="activeTab === 1 && showref" label-width="140px" :model="appNode.rawData">
                <template v-for="f in appNode.refInputFields" :key="f.guid">
                    <h2 v-if="!invisibleFields[f.name]">{{ _L(f.display) || f.name }}</h2>
                    <schema-view
                        plain-text="left"
                        :node="(f as AnySchemaNode)"
                        :in-form="true"
                        :skin="skin"
                    ></schema-view>
                    <br/>
                </template>
            </el-form>

            <el-form v-show="activeTab === 2 && showoutput" label-width="140px" :model="appNode.rawData">
                <template v-for="f in appNode.pushFields" :key="f.guid">
                    <h2 v-if="!invisibleFields[f.name]">{{ _L(f.display) || f.name }}</h2>
                    <schema-view
                        plain-text="left"
                        :node="(f as AnySchemaNode)"
                        :in-form="true"
                        :skin="skin"
                    ></schema-view>
                    <br/>
                </template>
            </el-form>
        </el-main>
    </el-container>
</template>

<script lang="ts" setup>
import { fa } from "element-plus/es/locales.mjs";
import { addAppTarget } from "../appSchema";
import { ElMessage, type ElForm } from "element-plus"
import { getSchemaNode, getAppDataProvider, getAppNode, StructNode, type AppNode, type AnySchemaNode, isNull, type ILocaleString, getSchema, WorkflowMode, _LS, getAppSchema } from "schema-node"
import { schemaView, _L } from "schema-node-vueview"
import { onMounted, onUnmounted, reactive, ref } from "vue"

const props = defineProps<{ app: string, skin?: string }>()
const form = ref<InstanceType<typeof ElForm>>()
const activeTargetTab = ref(0)
const activeTab = ref(0)

const appNode = ref<AppNode | undefined>(undefined)
const dataProvider = getAppDataProvider()
const enableAppData = dataProvider ? true : false
const manualWorkflows = ref<{ workflow: string, display: ILocaleString }[]>([])

// app target node
const empty_guid = "00000000-0000-0000-0000-000000000000"
const appTargetNode = ref<StructNode | undefined>(undefined)
const useempty = () => appTargetNode.value!.getField("target")!.data = empty_guid
const genguid = () => appTargetNode.value!.getField("target")!.data = crypto.randomUUID()
const gensourceguid = () => sourceAppNode.value!.getField("target")!.data = crypto.randomUUID()

// source app and target
const sourceAppNode = ref<StructNode | undefined>(undefined)

const loading = ref(false)
const saving = ref(false)
const showref = ref(false)
const showoutput = ref(false)
const startWorkflowing = ref(false)
const statusWatcher: Function[] = []
const invisibleFields = reactive<{[key: string]: boolean}>({})

const loadData = async() => {
    if (!appTargetNode.value) return
    try {
        const target = appTargetNode.value.getField("target")!.rawData as string
        if (isNull(target)) return
        loading.value = true
        appNode.value = await getAppNode({
            app: props.app,
            target: target,
            fields: [],
            take: 5,
            schemaOnly: true
        })
        const appSchema = await getAppSchema(props.app)
        const manualflows: { workflow: string, display: ILocaleString }[] = []

        // visible check
        statusWatcher.forEach(f => f())
        statusWatcher.length = 0
        appNode.value?.fields.forEach(f => {
            statusWatcher.push(f.subscribeState(() => {
                invisibleFields[f.name] = f.invisible || false
            }, true))
        })

        for (const wf of appSchema!.workflows || [])
        {
            if (!wf.nodes?.length) continue
            const startSchema = await getSchema(wf.nodes[0].type)
            if (startSchema?.workflow?.mode === WorkflowMode.Interaction)
            {
                manualflows.push({ workflow: wf.name, display: wf.display || _LS(wf.name) })
            }
        }
        manualWorkflows.value = manualflows
    } catch(ex: any) {
        manualWorkflows.value = []
        if (ex && ex.status === 403)
        {
            ElMessage.error(_L.value["frontend.view.nopermission"])
            return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
    }
    finally{
        loading.value = false
    }
}

const saveData = async() => {
    if (!appTargetNode.value || !appNode.value) return
    try {
        await form.value?.validate()
        if (!appNode.value.valid) return

        const target = appTargetNode.value.getField("target")!.rawData as string
        if (isNull(target)) return

        saving.value = true
        const r = await appNode.value.submit();
        if (!r?.result) {
            if (r?.error)
                ElMessage.error(_L.value(r?.error || "frontend.view.savefailed"))
            return
        }
        else
        {
            ElMessage.success(_L.value("frontend.view.savesuccess"))
        }
        
        addAppTarget(props.app, target)
        appTargetNode.value.getField("app")!.data = ""
        await new Promise(resolve => setTimeout(resolve, 100))
        appTargetNode.value.getField("app")!.data = props.app

        // re-load data
        await loadData()
    } catch(ex: any) {
        if (ex && ex.status === 403)
        {
            ElMessage.error(_L.value["frontend.view.nopermission"])
            return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.log(JSON.stringify(appNode.value.fullerror))
        return
    }
    finally{
        saving.value = false
    }
}

const loadSourceTarget = async() => {
    if (!sourceAppNode.value || !appTargetNode.value) return
    try {
        const target = appTargetNode.value?.getField("target")!.data as string
        const sourceApp = sourceAppNode.value.getField("app")!.data as string
        if (isNull(target) || isNull(sourceApp)) return
        loading.value = true
        const sourceTarget = await dataProvider!.getSourceTarget(props.app, target, sourceApp)
        sourceAppNode.value!.getField("target")!.data = sourceTarget || ""
     } catch(ex: any) {
        if (ex && ex.status === 403)
        {
            ElMessage.error(_L.value["frontend.view.nopermission"])
            return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
    }
    finally{
        loading.value = false
    }
}

const saveSourceTarget = async() => {
    if (!sourceAppNode.value || !appTargetNode.value) return
    try {
        const target = appTargetNode.value.getField("target")!.data as string
        const sourceApp = sourceAppNode.value.getField("app")!.data as string
        const sourceTarget = sourceAppNode.value.getField("target")!.data as string
        if (isNull(target) || isNull(sourceApp)) return

        saving.value = true
        const r = await dataProvider!.setSourceTarget(props.app, target, sourceApp, sourceTarget);
        if (!r) {
            ElMessage.error(_L.value("frontend.view.savefailed"))
            return
        }
        else
        {
            ElMessage.success(_L.value("frontend.view.savesuccess"))
        }
        if (sourceTarget) addAppTarget(sourceApp, sourceTarget)
     } catch(ex: any) {
        if (ex && ex.status === 403)
        {
            ElMessage.error(_L.value["frontend.view.nopermission"])
            return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
    }
    finally{
        saving.value = false
    }
}

const startWorkflow = async (workflow: string) => {
    if (!appTargetNode.value || !appNode.value) return
    try {
        const target = appTargetNode.value.getField("target")!.rawData as string
        if (isNull(target)) return

        startWorkflowing.value = true
        const r = await appNode.value.activeWorkflow(workflow);
        if (!r) {
            ElMessage.error(_L.value("frontend.view.startworkflowfailed"))
        }
        else
        {
            ElMessage.success(_L.value("frontend.view.startworkflowsuccess"))
        }
    } catch(ex: any) {
        if (ex && ex.status === 403)
        {
            ElMessage.error(_L.value["frontend.view.nopermission"])
            return
        }
        ElMessage.error(_L.value["frontend.view.error"])
        console.error(ex)
        return
    }
    finally{
        startWorkflowing.value = false
    }
}

onMounted(async() => {
    appNode.value = await getAppNode({
        app: props.app,
        target: "",
        fields: [],
        schemaOnly: true
    })
    showref.value = appNode.value?.refInputFields.length ? true : false
    showoutput.value = appNode.value?.pushFields.length ? true : false
    if (!enableAppData) return

    appTargetNode.value = (await getSchemaNode({
        type: "frontend.apptarget"
    }, { allowApps: [props.app],  app: props.app, target: ""})) as StructNode

    const sourceApps = appNode.value?.sourceApps || []
    if (sourceApps.length > 0)
        sourceAppNode.value = (await getSchemaNode({
            type: "frontend.apptarget"
        }, { allowApps: sourceApps, app: sourceApps[0], target: "" })) as StructNode
})

onUnmounted(() => {
    statusWatcher.forEach(f => f())
    statusWatcher.length = 0
})

</script>