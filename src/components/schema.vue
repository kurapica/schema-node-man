<template>
    <el-container class="main">
        <el-header style="height: fit-content;">
            <el-form 
                :model="state" 
                style="display: flex;"
                hide-required-asterisk
                inline>
                <schema-view 
                    v-model="state.namespace"
                    in-form
                    :config="{
                        type: 'schema.namespace',
                        display: _L['schema.namespace']
                    }"
                ></schema-view>
            </el-form>
        </el-header>
    </el-container>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import schemaView from 'schema-node-vue-view'
import { _L } from 'schema-node-vue-view'

const state = reactive({
    namespace: "",
    type: null,
    keyword: ""
})
</script>