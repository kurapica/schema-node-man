<template>
    <el-container class="main">
        <el-header style="height: fit-content; width: 100%;">
            <el-form :model="state" style="display: flex;" hide-required-asterisk inline>
                <schema-view v-model="state.namespace" in-form :config="{
                    type: 'schema.namespace',
                    display: _L['schema.namespace']
                }"></schema-view>
                <schema-view v-model="state.type" in-form :config="{
                    type: 'schema.schematype',
                    display: _L['schema.schematype']
                }"></schema-view>
                <schema-view v-model="state.keyword" in-form :config="{
                    type: 'system.string',
                    display: _L['schema.designer.keyword']
                }"></schema-view>
                <el-button type="primary" @click="reset">{{ _L["schema.designer.reset"] }}</el-button>
            </el-form>
        </el-header>
        <el-main>
            <el-table :data="schemas" style="width: 100%; height: 70vh;" :border="true" header-align="left"
                :header-cell-style="{ background: '#eee' }">
                <el-table-column align="left" prop="name" :label="_L['schema.designer.name']" min-width="120" />
                <el-table-column align="left" prop="desc" :label="_L['schema.designer.desc']" min-width="150" />
                <el-table-column align="center" prop="type" :label="_L['schema.designer.type']" width="150">
                    <template #default="scope">
                        {{ _L['schema.schematype.' + scope.row.type] }}
                    </template>
                </el-table-column>
                <el-table-column align="left" header-align="center" :label="_L['schema.designer.oper']" width="240">
                    <template #header>
                        <a href="javascript:void(0)" v-if="state.namespace" @click="goback"
                            style="text-decoration: underline; color: lightseagreen;">{{ _L["schema.designer.return"] }}</a>
                        <span v-else>{{ _L["schema.designer.oper"]}}</span>
                    </template>
                    <template #default="scope">
                        <el-button v-if="scope.row.type === SchemaType.Namespace && scope.row.schemas?.length" type="info"
                            @click="choose(scope.row)">{{ _L["schema.designer.down"] }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import schemaView from 'schema-node-vue-view'
import { _L } from 'schema-node-vue-view'
import { getSchema, type INodeSchema, SchemaType } from 'schema-node'

const schemas = ref<INodeSchema[]>([])
const schemaTypeOrder = {
    [SchemaType.Namespace]: 1,
    [SchemaType.Scalar]: 2,
    [SchemaType.Enum]: 3,
    [SchemaType.Struct]: 4,
    [SchemaType.Array]: 5,
    [SchemaType.Function]: 6
}

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

const goback = () => {
    const paths = state.namespace.split(".")
    state.namespace = paths.slice(0, paths.length - 1).join(".")
}

const choose = (schema: INodeSchema) => {
    state.namespace = schema.name
}

watch(state, async () => {
    const schema = await getSchema(state.namespace)
    if (schema?.type === SchemaType.Namespace) {
        let temp = [...schema.schemas || []].filter(p => p.name !== "schema")
        if (state.type)
        {
            temp = temp.filter(p => p.type === state.type)
        }
        if (state.keyword)
        {
            temp = temp.filter(p => p.name.match(state.keyword) || p.desc && `${p.desc}`.match(state.keyword))
        }
        temp.sort((a, b) => {
            if (schemaTypeOrder[a.type] < schemaTypeOrder[b.type]) return -1
            if (schemaTypeOrder[a.type] < schemaTypeOrder[b.type]) return 1
            return a.name < b.name ? -1 : 1
        } )
        schemas.value = temp
    }
}, { immediate: true })
</script>