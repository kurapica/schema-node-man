<template>
  <el-form ref="form" label-width="240px" :model="data" label-position="left" >
    <schema-view
      text="left"
      :props="{ display: _LS('frontend.view.tryit') }"
      :type="type"
      in-form="expandall"
      v-model="data"
      :skin="skin"
      debug
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
import { _LS } from "schema-node-core"
import type { ElForm } from "element-plus"
import { schemaView, _L } from "schema-node-vue-view"
import { ref } from "vue"

defineProps<{ type: string, skin?: string }>()
const data = ref(null)
const form = ref<InstanceType<typeof ElForm>>()

</script>