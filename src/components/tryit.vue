<template>
    <el-form label-width="140px">
        <schema-view
            plain-text="left"
            type="frontend.person"
            v-model="data"
        ></schema-view>
        <textarea style="width:72lh;height: 300px;" disabled>{{ data }}</textarea>
    </el-form>
</template>

<script lang="ts" setup>
import SchemaView from "schema-node-vue-view"
import { ref } from "vue"

const data = ref({})
</script>