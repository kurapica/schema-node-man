<template>
    <el-form v-if="appNode" ref="form" label-width="140px" :model="appNode.rawData">
        <template v-for="f in appNode.fields">
            <h2>{{ _L(f.display) || f.name }}</h2>
            <schema-view
                plain-text="left"
                :node="(f as AnySchemaNode)"
                :in-form="true"
                :skin="skin"
            ></schema-view>
        </template>
    </el-form>
</template>

<script lang="ts" setup>
import type { ElForm } from "element-plus";
import { getAppNode, type AnySchemaNode, type AppNode } from "schema-node";
import { schemaView, _L } from "schema-node-vueview"
import { onMounted, ref } from "vue"

const props = defineProps<{ app: string, skin?: string }>()
const form = ref<InstanceType<typeof ElForm>>()

const appNode = ref<AppNode | undefined>(undefined)

onMounted(async() => {
    appNode.value = await getAppNode({
        app: props.app,
        target: "",
        fields: []
    })
})


</script>