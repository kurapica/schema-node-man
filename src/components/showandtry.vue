<template>
    <section>
        <el-button type="success" @click="showtryit = true">{{ _L["frontend.view.clicktotry"] }}</el-button>
        <el-drawer v-model="showtryit" :title="_L['frontend.nav.tryit']" direction="rtl" size="100%" append-to-body>
            <el-container class="main theme-panel" style="height: 80vh;">
                <el-main>
                    <template v-if="isnamespace">
                        <el-form v-if="schemaNode" ref="editorRef" :model="schemaNode.rawValue" label-width="160"
                            label-position="left" style="width: 100%; height: 90%;">
                            <div class="draw-view">
                                <schema-view
                                    :node="(schemaNode as StructNode)"
                                    in-form="expandall"
                                    text="left"
                                ></schema-view>
                            </div>
                        </el-form>
                    </template>
                    <template v-else>
                        <el-tabs v-model="activeTab">
                            <el-tab-pane :label="_L['frontend.view.tryit']" :name="0"></el-tab-pane>
                            <el-tab-pane :label="_L['frontend.view.schema']" :name="1"></el-tab-pane>
                        </el-tabs>
                        <el-form v-if="activeTab === 1 && schemaNode" ref="editorRef" :model="schemaNode.rawValue" label-width="160"
                            label-position="left" style="width: 100%; height: 90%;">
                            <div class="draw-view">
                                <schema-view
                                    :node="(schemaNode as StructNode)"
                                    in-form="expandall"
                                    text="left"
                                ></schema-view>
                            </div>
                        </el-form>
                        <tryit v-if="activeTab === 0" :type="type" :skin="skin"></tryit>
                    </template>
                </el-main>
                <el-footer>
                    <br/>
                    <el-button @click="showtryit = false">{{ _L["frontend.view.close"] }}</el-button>
                </el-footer>
            </el-container>
        </el-drawer>
    </section>
</template>

<script setup lang="ts">
import { getNodeType, jsonClone, NS_SYSTEM_SCHEMA_NODE, ReadOnly, SCHEMA_KIND_FUNCTION, SCHEMA_KIND_NAMESPACE, SchemaType, StructNode, StructType, SystemReflectType } from 'schema-node-core'
import tryit from './tryit.vue'
import { ref, toRaw, watch } from 'vue'
import { _L, schemaView } from 'schema-node-vue-view'

const props = defineProps<{ type: string, skin?: string }>()
const activeTab = ref(0)
const schemaNode = ref<StructNode | null>(null)
const showtryit = ref(false)
const isnamespace = ref(false)

watch(() => props.type, async () => {
    const nodeType = await getNodeType(props.type)
    if (nodeType)
    {
        isnamespace.value = !await SystemReflectType.isvaluekind(props.type);

        const nodeSchemaType = await getNodeType(`${NS_SYSTEM_SCHEMA_NODE}.schema`) as StructType;
        schemaNode.value = nodeSchemaType.create(nodeType.getNodeSchema()) as StructNode;
        schemaNode.value.setPropertyValue(ReadOnly, true);
    }
}, { immediate: true })
</script>

<style lang="css">
.theme-panel {
    color: var(--app-text);
    background-color: var(--app-surface);
}

.el-form-item .el-form-item {
    margin-bottom: 18px;
}
</style>