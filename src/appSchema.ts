import { type IStructFieldRelation, type IFunctionCallArgument, type IAppFieldSchema, _LS, getAppCachedSchema, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, registerAppSchema, registerSchema, SchemaLoadState, SchemaType, type IAppSchema, type IStructScalarFieldConfig, RelationType, getCachedSchema, NS_SYSTEM_STRINGS, getAppSchema, getSchema, ARRAY_ELEMENT } from "schema-node"

// Schema for definition
registerSchema([
    {
        name: "schema.app",
        type: SchemaType.Namespace,
        desc: _LS("schema.app")
    },
    {
        name: "schema.app.srcapp",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.srcapp"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "schema.app.srcfld",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.srcfld"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "schema.app.accessfld",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.accessfld"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "schema.app.pushfld",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.pushfld"),
        scalar: {
            base: "schema.app.accessfld"
        }
    },
    {
        name: "schema.app.appinput",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.appinput"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "schema.app.pushflds",
        type: SchemaType.Array,
        desc: _LS("schema.app.pushflds"),
        array: {
            element: "schema.app.pushfld"
        }
    },
    {
        name: "schema.app.fieldvalarg",
        type: SchemaType.Struct,
        desc: _LS("schema.app.fieldvalarg"),
        struct: {
            fields: [
                {
                    name: "label",
                    type: NS_SYSTEM_STRING,
                    displayOnly: true,
                    display: _LS("schema.funccallarg.display"),
                },
                {
                    name: "type",
                    type: "schema.valuetype",
                    invisible: false,
                    displayOnly: true,
                    display: _LS("schema.structfldfuncarg.type"),
                },
                {
                    name: "name",
                    type: "schema.app.accessfld",
                    display: _LS("schema.app.fieldvalarg.name")
                },
                {
                    name: "value",
                    type: "schema.anyvalue",
                    display: _LS("schema.app.fieldvalarg.value")
                },
            ],
            relations: [
                {
                    field: "name",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "name",
                    type: RelationType.Disable,
                    func: "schema.isvaluenotnull",
                    args: [
                        {
                            name: "value"
                        }
                    ]
                },
                {
                    field: "value",
                    type: RelationType.Type,
                    func: "schema.getexpvaluetype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "value",
                    type: RelationType.Disable,
                    func: "schema.hideexpvalue",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            name: "name"
                        }
                    ]
                },
            ]
        }
    },
    {
        name: "schema.app.fieldvalargs",
        type: SchemaType.Array,
        desc: _LS("schema.app.fieldvalargs"),
        array: {
            element: "schema.app.fieldvalarg"
        }
    },
    {
        name: "schema.app.getfieldtype",
        type: SchemaType.Function,
        desc: _LS("schema.getfieldtype"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING
                },
            ],
            exps: [],
            func: async (field: string) => {
                const appSchema = await getAppSchema(localStorage["schema_curr_app"])
                const fields = appSchema?.fields || []
                const paths = (field || "").split(".")
                if (paths.length === 0) return null
                let tarField: { type: string } | undefined = (fields || []).find(p => p.name === paths[0])
                for (let i = 1; i < paths.length; i++) {
                    if (!tarField) return null

                    let schema = await getSchema(tarField.type)
                    if (schema?.type === SchemaType.Array && schema.array?.element) {
                        schema = await getSchema(schema.array!.element)
                    }

                    if (paths[i] === ARRAY_ELEMENT)
                    {
                        return schema?.name
                    }

                    if (schema?.type === SchemaType.Struct && schema.struct?.fields) {
                        tarField = schema.struct.fields.find(p => p.name === paths[i])
                    }
                    else {
                        tarField = undefined
                    }
                }
                return tarField?.type
            }
        }
    },
    {
        name: "schema.app.fieldrelation",
        type: SchemaType.Struct,
        desc: _LS("schema.app.fieldrelation"),
        struct: {
            fields: [
                {
                    name: "field",
                    require: true,
                    type: "schema.app.accessfld",
                    display: _LS("schema.app.fieldrelation.field")
                },
                {
                    name: "fieldType",
                    displayOnly: true,
                    invisible: true,
                    type : "schema.valuetype",
                    display: _LS("schema.structfldrelationinfo.fieldtype"),
                },
                {
                    name: "return",
                    displayOnly: true,
                    invisible: true,
                    type: "schema.valuetype",
                    display: _LS("schema.structfldrelationinfo.return"),
                },
                {
                    name: "type",
                    require: true,
                    type: "schema.relationtype",
                    display: _LS("schema.app.fieldrelation.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "schema.functype",
                    display: _LS("schema.app.fieldrelation.func"),
                },
                {
                    name: "args",
                    type: "schema.app.fieldvalargs",
                    display: _LS("schema.app.fieldrelation.args"),
                },
            ],
            relations: [
                {
                    field: "fieldType",
                    type: RelationType.Default,
                    func: "schema.app.getfieldtype",
                    args: [
                        {
                            name: "field"
                        }
                    ]
                },
                {
                    field: "type",
                    type: RelationType.WhiteList,
                    func: "schema.getrelationwhitelist",
                    args: [
                        {
                            name: "fieldType"
                        }
                    ]
                },
                {
                    field: "return",
                    type: RelationType.Default,
                    func: "schema.getrelationfuncreturn",
                    args: [
                        {
                            name: "fieldType"
                        },
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "func",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "return"
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "schema.app.fieldrelations",
        type: SchemaType.Array,
        desc: _LS("schema.app.fieldrelations"),
        array: {
            element: "schema.app.fieldrelation",
            primary: [ "field", "type" ]
        }
    },
    {
        name: "schema.app.getsourceappblacklist",
        type: SchemaType.Function,
        desc: _LS("schema.app.getsourceappblacklist"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [],
            exps: [],
            func: () => {
                const currapp = localStorage["schema_curr_app"]
                return currapp ? [currapp] : []
            }
        }
    },
    {
        name: "schema.app.getsourceappfldinfo",
        type: SchemaType.Function,
        desc: _LS("schema.app.getsourceappfldinfo"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "sourceApp",
                    type: NS_SYSTEM_STRING
                },
                {
                    name: "sourceFld",
                    type: NS_SYSTEM_STRING
                },
                {
                    name: "info",
                    type: NS_SYSTEM_STRING
                }
            ],
            exps: [],
            func: async (app: string, fld: string, info: string) => {
                const appSchema = await getAppSchema(app)
                const f = appSchema?.fields?.find(f => f.name === fld)
                return f ? (f as any)[info] : undefined
            }
        }
    },
    {
        name: "schema.app.field",
        type: SchemaType.Struct,
        desc: _LS("schema.app.field"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "schema.varname",
                    display: _LS("schema.app.field.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "schema.valuetype",
                    display: _LS("schema.app.field.type"),
                },
                {
                    name: "display",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.field.display"),
                    upLimit: 64,
                },
                {
                    name: "desc",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.field.desc"),
                    upLimit: 255,
                },
                {
                    name: "sourceApp",
                    type: "schema.app.srcapp",
                    display: _LS("schema.app.field.sourceapp"),
                },
                {
                    name: "sourceField",
                    type: "schema.app.srcfld",
                    display: _LS("schema.app.field.sourcefld"),
                },
                {
                    name: "incrUpdate",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.incrupdate"),
                },
                {
                    name: "frontend",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.frontend"),
                },
                {
                    name: "disable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.disable"),
                },
                {
                    name: "func",
                    type: "schema.pushfunctype",
                    display: _LS("schema.app.field.func"),
                },
                {
                    name: "args",
                    type: "schema.app.pushflds",
                    display: _LS("schema.app.field.args"),
                },
            ],
            relations: [
                {
                    field: "name",
                    type: RelationType.Default,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "sourceField"
                        }
                    ]
                },
                {
                    field: "display",
                    type: RelationType.Default,
                    func: "schema.app.getsourceappfldinfo",
                    args: [
                        {
                            name: "sourceApp"
                        },
                        {
                            name: "sourceField"
                        },
                        {
                            value: "display"
                        }
                    ]
                },
                {
                    field: "desc",
                    type: RelationType.Default,
                    func: "schema.app.getsourceappfldinfo",
                    args: [
                        {
                            name: "sourceApp"
                        },
                        {
                            name: "sourceField"
                        },
                        {
                            value: "desc"
                        }
                    ]
                },
                {
                    field: "type",
                    type: RelationType.Default,
                    func: "schema.app.getsourceappfldinfo",
                    args: [
                        {
                            name: "sourceApp"
                        },
                        {
                            name: "sourceField"
                        },
                        {
                            value: "type"
                        }
                    ]
                },
                {
                    field: "sourceApp",
                    type: RelationType.BlackList,
                    func: "schema.app.getsourceappblacklist",
                    args: []
                },
                {
                    field: "sourceField",
                    type: RelationType.Invisible,
                    func: "system.logic.isnull",
                    args: [
                        {
                            name: "sourceApp"
                        }
                    ]
                },
                {
                    field: "sourceField",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "func",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "args",
                    type: RelationType.Invisible,
                    func: "system.logic.isnull",
                    args: [
                        {
                            name: "func"
                        }
                    ]
                },
            ]
        }
    },
    {
        name: "schema.app.nofields",
        type: SchemaType.Function,
        desc: _LS("schema.app.nofields"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "app",
                    type: "schema.app.srcapp",
                    nullable: true,
                }
            ],
            exps: [],
            func: (app: string) => {
                if (!app) return true
                const schema = getAppCachedSchema(app)
                return (schema?.hasFields || schema?.fields?.length) ? false : true
            }
        }
    },
    {
        name: "schema.app.app",
        type: SchemaType.Struct,
        desc: _LS("schema.app.app"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "schema.app.appinput",
                    display: _LS("schema.app.app.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "display",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.app.display"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.app.desc"),
                    upLimit: 255,
                } as IStructScalarFieldConfig,
                {
                    name: "relations",
                    type: "schema.app.fieldrelations",
                    display: _LS("schema.app.app.relations"),
                },
            ],
            relations: [
                {
                    field: "relations",
                    type: RelationType.Invisible,
                    func: "schema.app.nofields",
                    args: [
                        {
                            name: "name"
                        }
                    ]
                }
            ]
        }
    }
], SchemaLoadState.System)

//#region App Schema storage

// reload schemas from storage
export function reloadStorageAppSchemas()
{
    const namelist = localStorage["schema_custom_applist"]
    const list = namelist ? JSON.parse(namelist) : null
    if (!list || !Array.isArray(list)) return

    const schemas: IAppSchema[] = []
    for(let i = 0; i < list.length; i++)
    {
        const data = localStorage[`schema_app_${list[i]}`]
        const schema = data ? JSON.parse(data) : null
        if (!schema || typeof(schema) !== "object") continue
        schemas.push(schema)
    }
    registerAppSchema(schemas)
}

// save schema to storage
export function saveStorageAppSchema(schema: IAppSchema)
{
    schema = getAppCachedSchema(schema.name)! // reload to gets the fields
    const namelist = localStorage["schema_custom_applist"]
    let list: string[] = namelist ? JSON.parse(namelist) : []
    const name = schema.name.toLowerCase()
    if (!Array.isArray(list)) list = []
    if (!list.includes(name))
    {
        list.push(name)
        list.sort()
        localStorage["schema_custom_applist"] = JSON.stringify(list)
    }
    localStorage[`schema_app_${name}`] = JSON.stringify({
        name: schema.name,
        display: schema.display,
        desc: schema.desc,
        fields: schema.fields?.map((f: IAppFieldSchema) => ({
            name: f.name,
            type: f.type,
            display: f.display,
            desc: f.desc,
            sourceApp: f.sourceApp,
            sourceField: f.sourceField,
            func: f.func,
            args: f.args ? [...f.args] : undefined,
            incrUpdate: f.incrUpdate,
            frontend: f.frontend,
            disable: f.disable,
        })),
        relations: schema.relations?.map((r: IStructFieldRelation) => ({
            field: r.field,
            func: r.func,
            type: r.type,
            args: r.args?.map((a: IFunctionCallArgument)  => ({
                name: a.name,
                value: a.value
            }))
        }))
    })
}

// delete schema from storage
export function removeStorageAppSchema(name: string | IAppSchema)
{
    name = (typeof(name) === "object" ? name.name : name).toLowerCase()
    delete localStorage[`schema_app_${name}`]
    const namelist = localStorage["schema_custom_applist"]
    let list: string[] = namelist ? JSON.parse(namelist) : []
    if (Array.isArray(list) && list.includes(name))
    {
        const index = list.findIndex(n => n === name)
        if (index >= 0)
        {
            list.splice(index, 1)
            localStorage["schema_custom_applist"] = JSON.stringify(list)
        }
    }
}

// clear all stroage schemas
export function clearAllStorageAppSchemas()
{
    const namelist = localStorage["schema_custom_applist"]
    const list = namelist ? JSON.parse(namelist) : null
    if (!list || !Array.isArray(list)) return

    for(let i = 0; i < list.length; i++)
    {
        delete localStorage[`schema_app_${list[i]}`]
    }
    delete localStorage["schema_custom_applist"]
    location.reload()
}

// save all custom types to the storage
export function saveAllCustomAppSchemaToStroage(root: string = "")
{
    const schema = getAppCachedSchema(root)
    schema?.apps?.forEach((s: IAppSchema) => {
        if ((s.loadState || 0) & SchemaLoadState.Custom)
        {
            saveStorageAppSchema(s)
            if (s.apps?.length)
            {
                saveAllCustomAppSchemaToStroage(s.name)
            }
        }
    })
}

//#endregion

//#region View

import sourceappView from "./view/appSourceView.vue"
import appInputView from "./view/appInputView.vue"
import appsrcfldView from "./view/appSrcfldView.vue"
import appaccessfldView from "./view/appAccessfldView.vue"
import appPushfldsView from "./view/appPushfldsView.vue"
import structfldrelationinfosView from "./view/structfldrelationinfosView.vue"
import structfldfuncargsView from "./view/structfldfuncargsView.vue"
import { regSchemaTypeView } from "schema-node-vueview"

regSchemaTypeView("schema.app.srcapp", sourceappView)
regSchemaTypeView("schema.app.appinput", appInputView)
regSchemaTypeView("schema.app.srcfld", appsrcfldView)
regSchemaTypeView("schema.app.accessfld", appaccessfldView)
regSchemaTypeView("schema.app.pushfld", appaccessfldView)
regSchemaTypeView("schema.app.pushflds", appPushfldsView)
regSchemaTypeView("schema.app.fieldrelations", structfldrelationinfosView)
regSchemaTypeView("schema.app.fieldvalargs", structfldfuncargsView)
//#endregion