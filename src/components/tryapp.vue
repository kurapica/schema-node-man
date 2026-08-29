<template>
  <el-container>
    <el-header>
      <el-form v-if="enableAppData && appTargetNode" ref="form" label-width="140px" label-position="left"
        :model="appTargetNode.rawValue!">
          <section style="float:right;margin-left: 1rem;">
            <el-button v-if="!issystemlevel" type="info" @click="useempty">{{ _L["frontend.view.useempty"] }}</el-button>
            <el-button  v-if="!issystemlevel" type="info" @click="genguid">{{ _L["frontend.view.genguid"] }}</el-button>
            <el-button type="primary" v-if="!saving" v-loading="loading" @click="loadData">{{
              _L["frontend.view.loaddata"] }}</el-button>
            <el-button type="warning" v-if="!loading" v-loading="loading" @click="saveData">{{
              _L["frontend.view.savedata"] }}</el-button>
          </section>
          <schema-view :node="(appTargetNode as StructNode)" :in-form="true" text="left">
          </schema-view>
      </el-form>
    </el-header>
    <el-main v-if="appNode" style="max-height: 55vh;margin-top:4rem;">
      <!-- manual workflow-->
      <template v-for="wf in manualWorkflows" :key="wf.name">
        <!-- Turn off workflow -->
        <el-button v-if="wf.togglable && wf.workflowId" v-loading="startWorkflowing"
          style="margin-bottom: 1rem; margin-right: 1rem;" type="danger" @click="turnOffWorkflow(wf.name)">
          {{ _L["frontend.view.turnoffworkflow"] }} - {{ _L(getPropertyValue(wf, Display)) || wf.name }}
        </el-button>

        <!-- Turn on workflow -->
        <el-button v-else v-loading="startWorkflowing" style="margin-bottom: 1rem; margin-right: 1rem;" type="primary"
          @click="startWorkflow(wf.name)">
          {{ _L(getPropertyValue(wf, Display)) || wf.name }}
        </el-button>
      </template>
      <el-tabs v-model="activeTab" v-if="showref || showoutput">
        <el-tab-pane :label="_L['frontend.view.inputfield']" :name="0"></el-tab-pane>
        <el-tab-pane v-if="showref" :label="_L['frontend.view.reffield']" :name="1"></el-tab-pane>
        <el-tab-pane v-if="showoutput" :label="_L['frontend.view.outputfield']" :name="2"></el-tab-pane>
      </el-tabs>

      <el-form v-show="activeTab === 0" ref="form" label-width="140px" :model="appNode.rawValue">
        <template v-for="f in appNode.inputFields" :key="f.id">
          <h2 v-if="!invisibleFields[f.name!]">{{ _L(f.getPropertyValue(Display)) || f.name }}</h2>
          <schema-view text="left" :node="(f as DataNode)" :in-form="true" :skin="skin" :header-cell-style="tableHeaderCellStyle"></schema-view>
        </template>
      </el-form>

      <el-form v-show="activeTab === 1 && showref" label-width="140px" :model="appNode.rawValue">
        <template v-for="f in appNode.viewFields" :key="f.id">
          <h2 v-if="!invisibleFields[f.name!]">{{ _L(f.getPropertyValue(Display)) || f.name }}</h2>
          <schema-view text="left" :node="(f as DataNode)" :in-form="true" :skin="skin" :header-cell-style="tableHeaderCellStyle"></schema-view>
          <br />
        </template>
      </el-form>

      <el-form v-show="activeTab === 2 && showoutput" label-width="140px" :model="appNode.rawValue">
        <template v-for="f in appNode.deriveFields" :key="f.id">
          <h2 v-if="!invisibleFields[f.name!]">{{ _L(f.getPropertyValue(Display)) || f.name }}</h2>
          <schema-view text="left" :node="(f as DataNode)" :in-form="true" :skin="skin" :header-cell-style="tableHeaderCellStyle"></schema-view>
          <br />
        </template>
      </el-form>
    </el-main>

    <el-drawer v-model="showInteraction" :title="_L(getPropertyValue(interactionWorkflow!, Display) || '')" direction="rtl" size="80%"
      append-to-body>
      <el-container class="main" style="height: 80vh;">
        <el-main>
          <schema-view v-if="interactionData" :key="interactionData.id" :node="interactionData as any" in-form="expandall"
            text="left" v-bind="$attrs" :header-cell-style="tableHeaderCellStyle"></schema-view>
        </el-main>
        <el-footer>
          <el-button type="success" @click="startWorkflow(interactionWorkflow!.name, interactionData?.rawValue)">
            {{ _L["CONFIRM"] }}
          </el-button>
        </el-footer>
      </el-container>
    </el-drawer>
  </el-container>
</template>

<script lang="ts" setup>
import { addAppTarget } from "../appSchema";
import { ElMessage, type ElForm } from "element-plus"
import { AppNode, AppScopeType, getAppNode, getAppSchemaProvider, IAppInteractionWorkflow } from "schema-node-app";
import { DataNode, Display, generateGuid, getNodeType, getPropertyValue, InVisible, isNull, StructNode, StructType, ValueType, Visible } from "schema-node-core";
import { schemaView, _L } from "schema-node-vue-view"
import { onMounted, onUnmounted, reactive, ref } from "vue"

const props = defineProps<{ app: string, skin?: string }>()
const form = ref<InstanceType<typeof ElForm>>()
const activeTab = ref(0)

const appNode = ref<AppNode | undefined>(undefined)
const dataProvider = getAppSchemaProvider()
const enableAppData = dataProvider ? true : false
const manualWorkflows = ref<IAppInteractionWorkflow[]>([])

// app target node
const empty_guid = "00000000-0000-0000-0000-000000000000"
const appTargetNode = ref<StructNode | undefined>(undefined)
const useempty = () => appTargetNode.value!.getAccessValue("target")!.setValue(empty_guid)
const genguid = () => appTargetNode.value!.getAccessValue("target")!.setValue(generateGuid())

const loading = ref(false)
const saving = ref(false)
const showref = ref(false)
const showoutput = ref(false)
const startWorkflowing = ref(false)
const statusWatcher: Function[] = []
const invisibleFields = reactive<{ [key: string]: boolean }>({})
const issystemlevel = ref(false)

const tableHeaderCellStyle = {
  backgroundColor: 'var(--app-surface-muted)',
  color: 'var(--app-text)',
  borderColor: 'var(--app-border)'
};

const loadData = async () => {
  if (!appTargetNode.value) return
  try {
    const target = (appTargetNode.value.getAccessValue("target")! as DataNode).rawValue as string
    if (!issystemlevel.value && isNull(target)) return
    loading.value = true;
    appNode.value = undefined;
    // appNode.value?.dispose()

    // load app node
    appNode.value = await getAppNode({
      app: props.app,
      target: target,
      fields: [],
      take: 5,
      schemaOnly: true,
      workflow: true
    })
    
    // visible check
    statusWatcher.forEach(f => f())
    statusWatcher.length = 0
    appNode.value?.fields.forEach((f:any) => {

      statusWatcher.push(f.subscribeProperty(InVisible, () => {
        invisibleFields[f.name] = !f.visible
      }))
      statusWatcher.push(f.subscribeProperty(Visible, () => {
        invisibleFields[f.name] = !f.visible
      }, true))
    })

    manualWorkflows.value = appNode.value!.interactionWorkflows
  } catch (ex: any) {
    manualWorkflows.value = []
    if (ex && ex.status === 403) {
      ElMessage.error(_L.value["frontend.view.nopermission"])
      return
    }
    ElMessage.error(_L.value["frontend.view.error"])
    console.error(ex)
    return
  }
  finally {
    loading.value = false
  }
}

const saveData = async () => {
  if (!appTargetNode.value || !appNode.value) return
  try {
    await form.value?.validate()
    // if (!appNode.value.valid) return

    const target = appTargetNode.value.getAccessValue("target")!.rawValue as string
    if (!issystemlevel.value && isNull(target)) return

    saving.value = true
    const r = await appNode.value.submit();
    if (!r?.result) {
      ElMessage.error(_L.value(r?.error || "frontend.view.savefailed"))
      return
    }
    else {
      ElMessage.success(_L.value("frontend.view.savesuccess"))
    }

    addAppTarget(props.app, target)
    appTargetNode.value.getAccessValue("app")!.setValue("")
    await new Promise(resolve => setTimeout(resolve, 100))
    appTargetNode.value.getAccessValue("app")!.setValue(props.app)
  } catch (ex: any) {
    if (ex && ex.status === 403) {
      ElMessage.error(_L.value["frontend.view.nopermission"])
      return
    }
    ElMessage.error(_L.value["frontend.view.error"])
    return
  }
  finally {
    saving.value = false
  }
}

const interactionData = ref<StructNode | undefined>(undefined)
const showInteraction = ref(false)
const interactionWorkflow = ref<IAppInteractionWorkflow | undefined>(undefined)

const startWorkflow = async (name: string, data: any = undefined) => {
  if (!appTargetNode.value || !appNode.value) return
  showInteraction.value = false
  try {
    const target = appTargetNode.value.getAccessValue("target")!.rawValue as string
    if (isNull(target)) return

    const workflow = manualWorkflows.value.find(wf => wf.name === name)
    if (!workflow?.nodes?.length) return

    const payloadType = workflow.nodes[0].payload
    if (isNull(data) && !isNull(payloadType)) {
      const payload = await getNodeType(payloadType) as ValueType;
      if (payload instanceof StructType && Array.from(payload.getFields()).length > 2) {
        const dataField = payload.getField("data")
        if (dataField) {
          interactionWorkflow.value = workflow
          interactionData.value = dataField.type!.create({}) as StructNode
          showInteraction.value = true
          return
        }
      }
    }

    startWorkflowing.value = true
    const r = await appNode.value.activeWorkflow(name, undefined, undefined, data, true);
    if (!r) {
      ElMessage.error(_L.value("frontend.view.startworkflowfailed"))
    }
    else {
      ElMessage.success(_L.value("frontend.view.startworkflowsuccess"))
    }
    // refresh manual workflows
    manualWorkflows.value = appNode.value.interactionWorkflows
  } catch (ex: any) {
    if (ex && ex.status === 403) {
      ElMessage.error(_L.value["frontend.view.nopermission"])
      return
    }
    ElMessage.error(_L.value["frontend.view.error"])
    console.error(ex)
    return
  }
  finally {
    startWorkflowing.value = false
  }
}

const turnOffWorkflow = async (workflow: string) => {
  if (!appTargetNode.value || !appNode.value) return
  try {
    const target = appTargetNode.value.getAccessValue("target")!.rawValue as string
    if (isNull(target)) return

    startWorkflowing.value = true
    await appNode.value.turnOffWorkflow(workflow);
    ElMessage.success(_L.value("frontend.view.turnoffworkflowsuccess"))

    // refresh manual workflows
    manualWorkflows.value = appNode.value.interactionWorkflows
  } catch (ex: any) {
    if (ex && ex.status === 403) {
      ElMessage.error(_L.value["frontend.view.nopermission"])
      return
    }
    ElMessage.error(_L.value("frontend.view.turnoffworkflowfailed"))
    console.error(ex)
    return
  }
  finally {
    startWorkflowing.value = false
  }
}

onMounted(async () => {
  appNode.value = await getAppNode({
    app: props.app,
    target: "",
    fields: [],
    schemaOnly: true
  })
  showref.value = Array.from(appNode.value!.viewFields).length ? true : false
  showoutput.value = Array.from(appNode.value!.deriveFields).length ? true : false
  if (!enableAppData) return

  issystemlevel.value = appNode.value?.appType.scopeType === AppScopeType.SystemLevel

  // visible check
  statusWatcher.forEach(f => f())
  statusWatcher.length = 0
  appNode.value?.fields.forEach(f => {
    statusWatcher.push(f.subscribeProperty(Visible, () => {
      invisibleFields[f.name!] = !f.visible
    }))
    statusWatcher.push(f.subscribeProperty(InVisible, () => {
      invisibleFields[f.name!] = !f.visible
    }, true))
  })

  appTargetNode.value = ((await getNodeType("frontend.apptarget")) as StructType)
    .create({ allowApps: [props.app], app: props.app, target: "" }) as StructNode;
})

onUnmounted(() => {
  statusWatcher.forEach(f => f())
  statusWatcher.length = 0
})

</script>