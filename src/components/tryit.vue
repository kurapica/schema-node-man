<template>
    <el-form ref="form" label-width="140px" :model="data">
        <schema-view
            plain-text="left"
            :type="type || 'frontend.person'"
            v-model="data"
        ></schema-view>
        <el-form-item>
            <el-button type="primary" @click="form?.validate()">{{ _L["schema.designer.validate"] }}</el-button>
        </el-form-item>
        <section style="width: 100%;text-align: center;">
            <textarea style="width:72lh;height: 300px;" disabled>{{ data }}</textarea>
        </section>
    </el-form>
</template>

<script lang="ts" setup>
import type { ElForm } from "element-plus";
import SchemaView, { _L } from "schema-node-vue-view"
import { ref } from "vue"

defineProps<{ type?: string }>()
const data = ref(null)
const form = ref<InstanceType<typeof ElForm>>()

</script>