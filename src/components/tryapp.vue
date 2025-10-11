<template>
    <el-container>
        <el-header>
            <el-form v-if="enableAppData && appTargetNode" ref="form" label-width="140px" label-position="left" :model="appTargetNode.rawData">
                <section style="float:right;">
                    <el-button type="info" @click="genguid">{{ _L["schema.designer.genguid"] }}</el-button>
                    <el-button type="primary" v-if="!saving" v-loading="loading" @click="loadData">{{ _L["schema.designer.loaddata"] }}</el-button>
                    <el-button type="warning" v-if="!loading" v-loading="loading" @click="saveData">{{ _L["schema.designer.savedata"] }}</el-button>
                </section>
                <schema-view
                    :node="(appTargetNode as StructNode)" 
                    :in-form="true" 
                    plain-text="left">
                </schema-view>
            </el-form>
        </el-header>
        <el-main v-if="appNode">
            <el-tabs v-model="activeTab" v-if="showref || showoutput">
                <el-tab-pane :label="_L['schema.designer.inputfield']" :name="0"></el-tab-pane>
                <el-tab-pane v-if="showref" :label="_L['schema.designer.reffield']" :name="1"></el-tab-pane>
                <el-tab-pane v-if="showoutput" :label="_L['schema.designer.outputfield']" :name="2"></el-tab-pane>
            </el-tabs>

            <el-form v-show="activeTab === 0" ref="form" label-width="140px" :model="appNode.rawData">
                <template v-for="f in appNode.inputFields" :key="f.guid">
                    <h2>{{ _L(f.display) || f.name }}</h2>
                    <schema-view
                        plain-text="left"
                        :node="(f as AnySchemaNode)"
                        :in-form="true"
                        :skin="skin"
                    ></schema-view>
                </template>
            </el-form>

            <el-form v-show="activeTab === 1 && showref" label-width="140px" :model="appNode.rawData">
                <template v-for="f in appNode.refFields" :key="f.guid">
                    <h2>{{ _L(f.display) || f.name }}</h2>
                    <schema-view
                        plain-text="left"
                        :node="(f as AnySchemaNode)"
                        :in-form="true"
                        :skin="skin"
                    ></schema-view>
                </template>
            </el-form>

            <el-form v-show="activeTab === 2 && showoutput" label-width="140px" :model="appNode.rawData">
                <template v-for="f in appNode.pushFields" :key="f.guid">
                    <h2>{{ _L(f.display) || f.name }}</h2>
                    <schema-view
                        plain-text="left"
                        :node="(f as AnySchemaNode)"
                        :in-form="true"
                        :skin="skin"
                    ></schema-view>
                </template>
            </el-form>
        </el-main>
    </el-container>
</template>

<script lang="ts" setup>
import { addAppTarget } from "@/appSchema";
import { ElMessage, type ElForm } from "element-plus"
import { getSchemaNode, getAppDataProvider, getAppNode, type AppNode, type StructNode, type AnySchemaNode, isNull } from "schema-node"
import { schemaView, _L } from "schema-node-vueview"
import { onMounted, ref } from "vue"

const props = defineProps<{ app: string, skin?: string }>()
const form = ref<InstanceType<typeof ElForm>>()
const activeTab = ref(0)

const appNode = ref<AppNode | undefined>(undefined)
const enableAppData = getAppDataProvider() ? true : false
const appTargetNode = ref<StructNode | undefined>(undefined)
const genguid = () => {
    appTargetNode.value!.getField("target")!.data = crypto.randomUUID()
    return loadData()
}
const loading = ref(false)
const saving = ref(false)
const showref = ref(false)
const showoutput = ref(false)

const loadData = async() => {
    if (!appTargetNode.value) return
    try {
        const target = appTargetNode.value.getField("target")!.rawData as string
        if (isNull(target)) return
        loading.value = true
        appNode.value = await getAppNode({
            app: props.app,
            target: target,
            fields: []
        })
    } catch(e) {
        console.error(e)
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
            ElMessage.error(_L.value(r?.error || "schema.designer.savefailed"))
            return
        }
        
        addAppTarget(props.app, target)
        appTargetNode.value.getField("app")!.data = ""
        await new Promise(resolve => setTimeout(resolve, 100))
        appTargetNode.value.getField("app")!.data = props.app

        // re-load data
        await loadData()
    } catch(e) {
        console.error(e)
    }
    finally{
        saving.value = false
    }
}

onMounted(async() => {
    appNode.value = await getAppNode({
        app: props.app,
        target: "",
        fields: []
    })
    showref.value = appNode.value?.refFields.length ? true : false
    showoutput.value = appNode.value?.pushFields.length ? true : false
    if (!enableAppData) return

    appTargetNode.value = (await getSchemaNode({
        type: "schema.app.apptarget"
    }, { app: props.app, target: ""})) as StructNode
})

</script>