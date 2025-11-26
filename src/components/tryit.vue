<template>
    <el-form ref="form" label-width="140px" :model="data">
        <schema-view
            plain-text="left"
            :config="{
                type: type,
                display: _L['frontend.view.tryit']
            }"
            in-form="expandall"
            v-model="data"
            :skin="skin"
        ></schema-view>
        <el-form-item>
            <el-button type="primary" @click="form?.validate()">{{ _L["frontend.view.validate"] }}</el-button>
        </el-form-item>
        <section style="width: 100%;text-align: center;">
            <textarea style="width:72lh;height: 20rem;" disabled>{{ data }}</textarea>
        </section>
    </el-form>
</template>

<script lang="ts" setup>
import type { ElForm } from "element-plus";
import { schemaView, _L } from "schema-node-vueview"
import { ref } from "vue"

defineProps<{ type: string, skin?: string }>()
const data = ref(null)
const form = ref<InstanceType<typeof ElForm>>()

</script>