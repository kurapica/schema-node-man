<template>
    <section v-if="appSchema">
        <h3>{{ appSchema.name }}</h3>
        <p>{{ _L(appSchema.display) }}</p>
        <el-table v-if="appSchema.fields?.length" :data="appSchema.fields" style="width: 100%">
            <el-table-column prop="name" :label="_L['system.schema.appfieldschema.name']"/>
            <el-table-column prop="type" :label="_L['system.schema.appfieldschema.type']" width="240">
                <template #default="scope">
                    <schema-view :config="{
                        type: 'system.schema.anytype',
                        readonly: true
                    }" :value="scope.row.type" plain-text="left"></schema-view>
                </template>
            </el-table-column>
            <el-table-column prop="display" :label="_L['system.schema.appfieldschema.display']">
                <template #default="scope">
                    {{ _L(scope.row.display) }}
                </template>
            </el-table-column>
        </el-table>
    </section>
    <section v-else>
        <p>No app selected.</p>
    </section>
</template>

<script lang="ts" setup>
import { getAppSchema, type IAppSchema } from 'schema-node'
import { _L } from 'schema-node-vueview'
import { ref, watch } from 'vue'
import { schemaView } from 'schema-node-vueview'

const props = defineProps<{ app?: string }>()
const appSchema = ref<IAppSchema | undefined>(undefined)

watch (() => props.app, async () => {
    appSchema.value = props.app ? await getAppSchema(props.app) : undefined
}, { immediate: true })
</script>