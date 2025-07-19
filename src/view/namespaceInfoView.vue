<template>
    <div v-if="state.schema">
        <!-- Common -->
        <div style="display: flex; margin-bottom: 12px; margin-top: 8px;">
            <!-- Type -->
            <el-tag v-if="state.schema.type">{{ _L[`schema.schematype.${state.schema.type}`]}}</el-tag>
            <!-- Array Element -->
            <el-tag v-if="state.eleschema?.type" type="success" style="margin-left: 12px;">{{ _L[`schema.schematype.${state.eleschema.type}`] }}</el-tag>
            <!-- Base Type -->
            <el-tag v-if="state.baseType" type="info" style="margin-left: 12px;">{{ _L[baseTyepMap[state.baseType]] }}</el-tag>
            <!-- Return -->
            <template v-if="state.retType">
                <el-tag v-if="typeof(state.retType) === 'string'" type="success" style="margin-left: 12px;">{{ state.retType }}</el-tag>
                <template v-else>
                    <!-- Type -->
                    <el-tag v-if="state.retType.schema?.type" style="margin-left: 12px;">{{ _L[`schema.schematype.${state.retType.schema.type}`] }}</el-tag>
                    <!-- Array Element -->
                    <el-tag v-if="state.retType.eleschema?.type" type="success" style="margin-left: 12px;">{{ _L[`schema.schematype.${state.retType.eleschema.type}`] }}</el-tag>
                    <!-- Base Type -->
                    <el-tag v-if="state.retType.baseType" type="info" style="margin-left: 12px;">{{ _L[baseTyepMap[state.retType.baseType]] }}</el-tag>
                </template>
            </template>
        </div>
        <div style="margin-left: 12px;">
            <!-- Enum -->
            <template v-if="state.schema.type === SchemaType.Enum">
                <el-breadcrumb v-if="state.schema.enum?.cascade && state.schema.enum.cascade.length > 0"
                    separator-class="el-icon-arrow-right" style="margin-bottom: 8px;">
                    <el-breadcrumb-item v-for="item in state.schema.enum.cascade">{{ item }}</el-breadcrumb-item>
                </el-breadcrumb>
                <ul>
                    <li v-for="item in state.schema.enum!.values.slice(0, 5)">{{ item.name }}</li>
                </ul>
            </template>
            <!-- Enum Array -->
            <template v-if="state.eleschema?.type === SchemaType.Enum">
                <el-breadcrumb v-if="state.eleschema.enum?.cascade && state.eleschema.enum.cascade.length > 0"
                    separator-class="el-icon-arrow-right" style="margin-bottom: 8px;">
                    <el-breadcrumb-item v-for="item in state.eleschema.enum.cascade">{{ item }}</el-breadcrumb-item>
                </el-breadcrumb>
                <ul>
                    <li v-for="item in state.eleschema.enum!.values.slice(0, 5)">{{ item.name }}</li>
                </ul>
            </template>
            <!-- Struct -->
            <template v-if="state.structure">
                <el-table :data="state.structure" row-key="label" default-expand-all
                    :tree-props="{ children: 'children' }">
                    <el-table-column prop="label" :label="_L['schema.structfieldtype.name']" min-width="240"></el-table-column>
                    <el-table-column prop="desc" :label="_L['schema.structfieldtype.desc']" min-width="240"></el-table-column>
                    <el-table-column prop="" :label="_L['schema.designer.tag']" min-width="240">
                        <template #default="scope">
                            <!-- Type -->
                            <el-tag v-if="scope.row.type">{{ _L[`schema.schematype.${scope.row.type}`] }}</el-tag>
                            <!-- Array Element -->
                            <el-tag v-if="scope.row.eleType" type="success" style="margin-left: 12px;">{{ _L[`schema.schematype.${scope.row.eleType}`] }}</el-tag>
                            <!-- Base Type -->
                            <el-tag v-if="scope.row.baseType" type="info" style="margin-left: 12px;">{{ _L[baseTyepMap[scope.row.baseType]] }}</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
            <!-- Return -->
            <template v-if="typeof(state.retType) === 'object' && state.retType.structure">
                <el-table :data="state.retType.structure" row-key="label" default-expand-all :tree-props="{ children: 'children' }" style="margin-bottom: 24px;">
                    <el-table-column prop="label" :label="_L['schema.designer.returnstruct']" min-width="240"></el-table-column>
                    <el-table-column prop="desc" :label="_L['schema.structfieldtype.name']" min-width="240"></el-table-column>
                    <el-table-column prop=""  :label="_L['schema.designer.tag']" min-width="240">
                        <template #default="scope">
                            <!-- Type -->
                            <el-tag v-if="scope.row.type">{{ _L[`schema.schematype.${scope.row.type}`] }}</el-tag>
                            <!-- Array Element -->
                            <el-tag v-if="scope.row.eleType" type="success" style="margin-left: 12px;">{{ _L[`schema.schematype.${scope.row.eleType}`] }}</el-tag>
                            <!-- Base Type -->
                            <el-tag v-if="scope.row.baseType" type="info" style="margin-left: 12px;">{{ _L[baseTyepMap[scope.row.baseType]] }}</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
            <!-- Arguments -->
            <template v-if="state.arguments">
                <el-table :data="state.arguments" row-key="label" default-expand-all
                    :tree-props="{ children: 'children' }">
                    <el-table-column prop="label" :label="_L['schema.funccallarg.display']" min-width="240"></el-table-column>
                    <el-table-column prop="" label="标签" min-width="240">
                        <template #default="scope">
                                <!-- Type -->
                            <el-tag v-if="scope.row.type">{{ _L[`schema.schematype.${scope.row.type}`] }}</el-tag>
                            <!-- Array Element -->
                            <el-tag v-if="scope.row.eleType" type="success" style="margin-left: 12px;">{{ _L[`schema.schematype.${scope.row.eleType}`] }}</el-tag>
                            <!-- Base Type -->
                            <el-tag v-if="scope.row.baseType" type="info" style="margin-left: 12px;">{{ _L[baseTyepMap[scope.row.baseType]] }}</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getSchema, NS_SYSTEM_BOOL, NS_SYSTEM_DATE, NS_SYSTEM_FULLDATE, NS_SYSTEM_INT, NS_SYSTEM_NUMBER, NS_SYSTEM_STRING, NS_SYSTEM_YEAR, NS_SYSTEM_YEARMONTH, SchemaType, type INodeSchema, type SchemaTypeValue } from 'schema-node'
import { reactive, watch } from 'vue'
import { _L } from 'schema-node-vueview'

interface ITypeStructInfo {
    label: string
    type?: SchemaTypeValue
    eleType?: SchemaTypeValue
    desc?: string
    baseType?: string | null
    useArg?: string
    children?: ITypeStructInfo[]
}

const props = defineProps<{ type?: string }>()
const baseTyepMap: { [key: string]: string } = {
    [NS_SYSTEM_BOOL]: NS_SYSTEM_BOOL,
    [NS_SYSTEM_STRING]: NS_SYSTEM_STRING,
    [NS_SYSTEM_DATE]: NS_SYSTEM_DATE,
    [NS_SYSTEM_YEAR]: NS_SYSTEM_YEAR,
    [NS_SYSTEM_FULLDATE]: NS_SYSTEM_FULLDATE,
    [NS_SYSTEM_YEARMONTH]: NS_SYSTEM_YEARMONTH,
    [NS_SYSTEM_NUMBER]: NS_SYSTEM_NUMBER,
    [NS_SYSTEM_INT]: NS_SYSTEM_INT,
}
const state: {
    schema?: INodeSchema
    eleschema?: INodeSchema
    baseType?: string | null
    structure?: ITypeStructInfo[]
    retType?: {
        schema?: INodeSchema
        eleschema?: INodeSchema
        baseType?: string | null
        structure?: ITypeStructInfo[]
        useArg?: string
    } | string,
    arguments?: ITypeStructInfo[]
} = reactive({})

// get base type
const getBaseType = async (type: string) => {
    let typeName: string | null | undefined = type
    while (typeName && !baseTyepMap[typeName]) {
        typeName = (await getSchema(typeName))?.scalar?.base
    }
    return typeName
}

// build struct info
const buildStruct = async (type: string): Promise<ITypeStructInfo[]> => {
    const schema = await getSchema(type)
    if (schema?.type !== SchemaType.Struct || !schema.struct?.fields) return []

    const infos: ITypeStructInfo[] = []
    for (let i = 0; i < schema.struct!.fields.length; i++) {
        const field = schema.struct.fields[i]
        const fschema = await getSchema(field.type)
        const info: ITypeStructInfo = { label: field.name, type: fschema!.type, desc: `${field.display}${field.unit ? `(${field.unit})` : ''}` }

        if (fschema?.type === SchemaType.Scalar) {
            info.baseType = await getBaseType(field.type)
        }
        else if (fschema?.type === SchemaType.Struct) {
            info.children = await buildStruct(field.type)
        }
        else if (fschema?.type === SchemaType.Array) {
            const eleschema = await getSchema(fschema.array!.element)
            if (eleschema) {
                info.eleType = eleschema.type

                if (eleschema.type === SchemaType.Scalar) {
                    info.baseType = await getBaseType(eleschema.name)
                }
                else if (eleschema.type === SchemaType.Struct) {
                    info.children = await buildStruct(eleschema.name)
                }
            }
        }

        infos.push(info)
    }
    return infos
}

const updateState = async (state: any, type: string) => {
    state.schema = await getSchema(type)
    state.baseType = ""
    state.structure = undefined
    if (state.schema?.type === SchemaType.Scalar) {
        state.baseType = await getBaseType(type)
    }
    else if (state.schema?.type === SchemaType.Struct) {
        state.structure = await buildStruct(type)
    }
    else if (state.schema?.type === SchemaType.Array) {
        const eleschema = state.schema.array?.element ? await getSchema(state.schema.array.element) : null
        if (eleschema) {
            state.eleschema = eleschema

            if (eleschema.type === SchemaType.Scalar) {
                state.baseType = await getBaseType(eleschema.name)
            }
            else if (eleschema.type === SchemaType.Struct) {
                state.structure = await buildStruct(eleschema.name)
            }
        }
    }
}

watch(() => props.type, async () => {
    if (!props.type) return

    await updateState(state, props.type)

    // For function
    if (state.schema?.type === SchemaType.Function) {
        if (state.schema.func?.return) {
            if (/^[tT]\d*$/.test(state.schema.func.return))
            {
                state.retType = state.schema.func.return
            }
            else
            {
                state.retType = {}
                await updateState(state.retType, state.schema.func!.return)
            }
        }

        if (state.schema.func?.args) {
            state.arguments = []

            for (let i = 0; i < state.schema.func.args.length; i++) {
                const arg = state.schema.func.args[i]
                const info: ITypeStructInfo = { label: arg.name }

                if (/^[tT]\d*$/.test(arg.type))
                {
                    // pass
                }
                else
                {
                    const fschema = arg.type ? await getSchema(arg.type) : null
                    info.type = fschema?.type
                    if (fschema?.type === SchemaType.Scalar) {
                        info.baseType = await getBaseType(arg.type)
                    }
                    else if (fschema?.type === SchemaType.Struct) {
                        info.children = await buildStruct(arg.type)
                    }
                    else if (fschema?.type === SchemaType.Array) {
                        const eleschema = await getSchema(fschema.array!.element)
                        if (eleschema) {
                            info.eleType = eleschema.type

                            if (eleschema.type === SchemaType.Scalar) {
                                info.baseType = await getBaseType(eleschema.name)
                            }
                            else if (eleschema.type === SchemaType.Struct) {
                                info.children = await buildStruct(eleschema.name)
                            }
                        }
                    }
                }
                state.arguments.push(info)
            }
        }
    }
}, { immediate: true })
</script>
