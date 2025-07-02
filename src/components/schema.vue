<template>
    <el-container class="main">
        <el-header style="height: fit-content; width: 100%;">
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
                <schema-view
                    v-model="state.type"
                    in-form
                    :config="{
                        type: 'schema.schematype',
                        display: _L['schema.schematype']
                    }"
                ></schema-view>
                <schema-view
                    v-model="state.keyword"
                    in-form
                    :config="{
                        type: 'system.string',
                        display: _L['schema.designer.keyword']
                    }"
                ></schema-view>
                <el-button type="primary" @click="reset">{{ _L["schema.designer.reset"] }}</el-button>
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

const reset = () => {
    state.namespace = ""
    state.type = null
    state.keyword = ""
}
</script>