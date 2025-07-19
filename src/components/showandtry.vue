<template>
    <section>
        <el-button type="success" @click="showtryit = true">{{ _L["schema.designer.clicktotry"] }}</el-button>
        <el-drawer v-model="showtryit" :title="_L['schema.nav.tryit']" direction="rtl" size="100%"
            destroy-on-close
            append-to-body>
            <el-container class="main" style="height: 80vh;color:black;">
                <el-main>
                    <template v-if="isnamespace">
                        <el-form v-if="schemaNode" ref="editorRef" :model="schemaNode.rawData" label-width="160"
                            label-position="left" style="width: 100%; height: 90%;">
                            <div class="draw-view">
                                <schema-view
                                    :node="(schemaNode as StructNode)"
                                    in-form="expandall"
                                    plain-text="left"
                                ></schema-view>
                            </div>
                        </el-form>
                    </template>
                    <template v-else>
                        <el-tabs v-model="activeTab">
                            <el-tab-pane :label="_L['schema.designer.tryit']" :name="0"></el-tab-pane>
                            <el-tab-pane :label="_L['schema.designer.schema']" :name="1"></el-tab-pane>
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
                        <tryit v-if="activeTab === 0" :type="type" :skin="skin"></tryit>
                    </template>
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
import { getSchema, jsonClone, SchemaType, StructNode } from 'schema-node'
import tryit from './tryit.vue'
import { ref, toRaw, watch } from 'vue'
import { _L, schemaView } from 'schema-node-vueview'

const props = defineProps<{ type: string, skin?: string }>()
const activeTab = ref(0)
const schemaNode = ref<StructNode | null>(null)
const showtryit = ref(false)
const isnamespace = ref(false)

watch(() => props.type, async () => {
    const schema = await getSchema(props.type)
    if (schema)
    {
        isnamespace.value = schema.type === SchemaType.Namespace || schema.type === SchemaType.Function
        schemaNode.value = new StructNode({
            type: "schema.namespacedefine",
            readonly: true
        }, jsonClone(toRaw(schema)))
    }
}, { immediate: true })
</script>

<style lang="css">
.el-form-item .el-form-item {
    margin-bottom: 18px;
}
</style>