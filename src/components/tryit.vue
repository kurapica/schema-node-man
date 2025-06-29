<template>
    <el-form label-width="140px">
        <schema-view
            plain-text="left"
            type="frontend.person"
            v-model="data"
        ></schema-view>
        <span>{{ data }}</span>
    </el-form>
</template>

<script lang="ts" setup>
import SchemaView from "schema-node-vue-view"
import { ref } from "vue"

const data = ref({})
</script>