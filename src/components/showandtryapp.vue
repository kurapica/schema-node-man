<template>
    <section>
        <el-button type="success" @click="showtryit = true">{{ _L["schema.designer.clicktotry"] }}</el-button>
        <el-drawer v-model="showtryit" :title="_L['schema.nav.tryit']" direction="rtl" size="100%"
            destroy-on-close
            append-to-body>
            <el-container class="main" style="height: 80vh;color:black;">
                <el-main>
                    <el-tabs v-model="activeTab">
                        <el-tab-pane :label="_L['schema.designer.tryit']" :name="0"></el-tab-pane>
                        <el-tab-pane :label="_L['schema.designer.app']" :name="1"></el-tab-pane>
                        <el-tab-pane :label="_L['schema.designer.fields']" :name="2"></el-tab-pane>
                    </el-tabs>
                    <el-form v-if="activeTab === 1 && schemaNode" ref="editorRef" :model="schemaNode.rawData" label-width="160"
                        label-position="left" style="width: 100%; height: 90%;">
                        <div class="draw-view">
                            <schema-view
                                :node="(schemaNode as StructNode)"
                                in-form="expandall"
                                plain-text="left"
                            ></schema-view>
                        </div>
                    </el-form>
                    <tryapp v-if="activeTab === 0" :app="app" :skin="skin"></tryapp>
                    <el-table v-if="activeTab === 2" :data="fields" :row-class-name="fieldRowClassName" style="width: 100%; height: 65vh;" :border="true"
                        header-align="left" 
                        :header-cell-style="{ background: '#eee' }">
                        <el-table-column align="left" prop="name" :label="_L['schema.designer.name']" min-width="120" />
                        <el-table-column align="left" prop="display" :label="_L['schema.designer.display']" min-width="150">
                            <template #default="scope">
                                <span>{{ _L(scope.row.display) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="left" prop="type" :label="_L['schema.designer.type']" min-width="120">
                            <template #default="scope">
                                <schema-view v-model="scope.row.type" :config="{
                                    type: 'schema.valuetype',
                                    readonly: true
                                }" plain-text="left"></schema-view>
                            </template>
                        </el-table-column>
                        <el-table-column align="left" prop="desc" :label="_L['schema.designer.desc']" min-width="150" />
                    </el-table>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button @click="showtryit = false">{{ _L["schema.designer.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>
    </section>
</template>

<script setup lang="ts">
import { getAppCachedSchema, jsonClone, StructNode, type IAppFieldSchema } from 'schema-node'
import tryapp from './tryapp.vue'
import { ref, toRaw, watch } from 'vue'
import { _L, schemaView } from 'schema-node-vueview'

const props = defineProps<{ app: string, skin?: string }>()
const activeTab = ref(0)
const schemaNode = ref<StructNode | null>(null)
const fields = ref<IAppFieldSchema[]>([])
const showtryit = ref(false)

const fieldRowClassName = (data: any) => {
    const { row } = data
    if (row.disable) return 'disable-row'
    if (row.sourceApp) return 'ref-row'
    if (row.func) return 'push-row'
    if (row.frontend) return 'frontend-row'
    return '';
}
watch(() => props.app, () => {
    const schema = getAppCachedSchema(props.app)
    if (schema)
    {
        schemaNode.value = new StructNode({
            type: "schema.app.app",
            readonly: true
        }, jsonClone(toRaw(schema)))
        fields.value = schema.fields ? [...schema.fields] : []
    }
}, { immediate: true })
</script>

<style lang="css">
.el-form-item .el-form-item {
    margin-bottom: 18px;
}
</style>