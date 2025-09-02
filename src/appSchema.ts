import { type IStructFieldRelation, type IFunctionCallArgument, type IAppFieldSchema, _LS, getAppCachedSchema, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, registerAppSchema, registerSchema, SchemaLoadState, SchemaType, type IAppSchema, type IStructScalarFieldConfig, RelationType, getCachedSchema } from "schema-node"

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
        name: "schema.app.appinput",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.appinput"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "schema.app.srcfldes",
        type: SchemaType.Array,
        desc: _LS("schema.app.srcfldes"),
        array: {
            element: "schema.app.srcfld"
        }
    },
    {
        name: "schema.app.fieldvalarg",
        type: SchemaType.Struct,
        desc: _LS("schema.app.fieldvalarg"),
        struct: {
            fields: [
                {
                    name: "name",
                    type: "schema.app.srcfld",
                    display: _LS("schema.app.fieldvalarg.name")
                },
                {
                    name: "value",
                    type: "schema.anyvalue",
                    display: _LS("schema.app.fieldvalarg.value")
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
        name: "schema.app.fieldrelation",
        type: SchemaType.Struct,
        desc: _LS("schema.app.fieldrelation"),
        struct: {
            fields: [
                {
                    name: "field",
                    require: true,
                    type: "schema.app.srcfld",
                    display: _LS("schema.app.fieldrelation.field")
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
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.field.desc"),
                    upLimit: 255,
                } as IStructScalarFieldConfig,
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
                    name: "func",
                    type: "schema.functype",
                    display: _LS("schema.app.field.func"),
                },
                {
                    name: "args",
                    type: "schema.app.srcfldes",
                    display: _LS("schema.app.field.args"),
                },
                {
                    name: "incrUpdate",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.incrupdate"),
                },
                {
                    name: "frontEnd",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.frontend"),
                },
                {
                    name: "disable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.disable"),
                },
            ],
            relations: [
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
                            name: "sourceApp"
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
                const schema = getCachedSchema(app)
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
            frontEnd: f.frontEnd,
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

import sourceappView from "./view/sourceappView.vue"
import appInputView from "./view/appInputView.vue"
import { regSchemaTypeView } from "schema-node-vueview"

regSchemaTypeView("schema.app.srcapp", sourceappView)
regSchemaTypeView("schema.app.appinput", appInputView)

//#endregion