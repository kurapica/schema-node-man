import { type IStructFieldConfig, type IFunctionArgumentInfo, type IFunctionExpression, type IStructFieldRelation, type IFunctionCallArgument, type IAppFieldSchema, _LS, getAppCachedSchema, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, registerAppSchema, registerSchema, SchemaLoadState, SchemaType, type IAppSchema, type IStructScalarFieldConfig, RelationType, NS_SYSTEM_STRINGS, getAppSchema, getSchema, ARRAY_ELEMENT, deepClone, type INodeSchema, isNull, getCachedSchema, _L } from "schema-node"

// Schema for definition
registerSchema([
    {
        name: "system.schema.app",
        type: SchemaType.Scalar,
        display: _LS("system.schema.app"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "system.schema.appfield",
        type: SchemaType.Scalar,
        display: _LS("system.schema.appfield"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "system.schema.appaccessfld",
        type: SchemaType.Scalar,
        display: _LS("system.schema.appaccessfld"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "system.schema.apppushfld",
        type: SchemaType.Scalar,
        display: _LS("system.schema.apppushfld"),
        scalar: {
            base: "system.schema.appaccessfld"
        }
    },
    {
        name: "system.schema.appinput",
        type: SchemaType.Scalar,
        display: _LS("system.schema.appinput"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "system.schema.apppushflds",
        type: SchemaType.Array,
        display: _LS("system.schema.apppushflds"),
        array: {
            element: "system.schema.apppushfld"
        }
    },
    {
        name: "system.schema.appfieldvalarg",
        type: SchemaType.Struct,
        display: _LS("system.schema.appfieldvalarg"),
        struct: {
            fields: [
                {
                    name: "label",
                    type: NS_SYSTEM_STRING,
                    displayOnly: true,
                    display: _LS("system.schema.funccallarg.display"),
                },
                {
                    name: "type",
                    type: "system.schema.valuetype",
                    invisible: false,
                    displayOnly: true,
                    display: _LS("system.schema.structfldfuncarg.type"),
                },
                {
                    name: "name",
                    type: "system.schema.appaccessfld",
                    display: _LS("system.schema.appfieldvalarg.name")
                },
                {
                    name: "value",
                    type: "system.schema.anyvalue",
                    display: _LS("system.schema.appfieldvalarg.value")
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
                    func: "system.schema.isvaluenotnull",
                    args: [
                        {
                            name: "value"
                        }
                    ]
                },
                {
                    field: "value",
                    type: RelationType.Type,
                    func: "system.schema.getexpvaluetype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "value",
                    type: RelationType.Disable,
                    func: "system.schema.hideexpvalue",
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
        name: "system.schema.appfieldvalargs",
        type: SchemaType.Array,
        display: _LS("system.schema.appfieldvalargs"),
        array: {
            element: "system.schema.appfieldvalarg"
        }
    },
    {
        name: "system.schema.appgetfieldtype",
        type: SchemaType.Func,
        display: _LS("system.schema.getfieldtype"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "app",
                    type: NS_SYSTEM_STRING,
                },
                {
                    name: "field",
                    type: NS_SYSTEM_STRING
                },
            ],
            exps: [],
            func: async (app: string, field: string) => {
                const appSchema = await getAppSchema(app)
                const fields = appSchema?.fields || []
                const paths = (field || "").split(".")
                if (paths.length === 0) return null
                let tarField: { type: string } | undefined = (fields || []).find((p:IAppFieldSchema) => p.name === paths[0])
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
                        tarField = schema.struct.fields.find((p: IStructFieldConfig) => p.name === paths[i])
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
        name: "system.schema.appfieldrelation",
        type: SchemaType.Struct,
        display: _LS("system.schema.appfieldrelation"),
        struct: {
            fields: [
                {
                    name: "field",
                    require: true,
                    type: "system.schema.appaccessfld",
                    display: _LS("system.schema.appfieldrelation.field")
                },
                {
                    name: "fieldType",
                    displayOnly: true,
                    invisible: false,
                    type : "system.schema.valuetype",
                    display: _LS("system.schema.structfieldrelation.fieldtype"),
                },
                {
                    name: "return",
                    displayOnly: true,
                    invisible: true,
                    type: "system.schema.valuetype",
                    display: _LS("system.schema.structfieldrelation.return"),
                },
                {
                    name: "type",
                    require: true,
                    type: "system.schema.relationtype",
                    display: _LS("system.schema.appfieldrelation.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "system.schema.functype",
                    display: _LS("system.schema.appfieldrelation.func"),
                },
                {
                    name: "args",
                    type: "system.schema.appfieldvalargs",
                    display: _LS("system.schema.appfieldrelation.args"),
                },
            ],
            relations: [
                {
                    field: "type",
                    type: RelationType.WhiteList,
                    func: "system.schema.getrelationwhitelist",
                    args: [
                        {
                            name: "fieldType"
                        }
                    ]
                },
                {
                    field: "return",
                    type: RelationType.Default,
                    func: "system.schema.getrelationfuncreturn",
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
        name: "system.schema.appfieldrelations",
        type: SchemaType.Array,
        display: _LS("system.schema.appfieldrelations"),
        array: {
            element: "system.schema.appfieldrelation",
            primary: [ "field", "type" ]
        }
    },
    {
        name: "system.schema.appgetsourceappblacklist",
        type: SchemaType.Func,
        display: _LS("system.schema.appgetsourceappblacklist"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "app",
                    type: NS_SYSTEM_STRING,
                }
            ],
            exps: [],
            func: (app: string) => {
                return app ? [app] : []
            }
        }
    },
    {
        name: "system.schema.appgetsourceappfldinfo",
        type: SchemaType.Func,
        display: _LS("system.schema.appgetsourceappfldinfo"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "sourceApp",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                },
                {
                    name: "sourceFld",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                },
                {
                    name: "info",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                },
                {
                    name: "type",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                }
            ],
            exps: [],
            func: async (app: string, fld: string, info: string, type: string) => {
                if (app && fld)
                {
                    const appSchema = await getAppSchema(app)
                    const f = appSchema?.fields?.find((f: IAppFieldSchema) => f.name === fld)
                    if (f) return (f as any)[info]
                }
                
                if (type)
                {
                    const schema = await getSchema(type)
                    if (schema)
                    {
                        if (info === "name") return schema.name.split(".").pop()
                        else if(info === "display") return schema.display
                    }
                }
                return null
            }
        }
    },
    {
        name: "system.schema.appiscombinedisable",
        type: SchemaType.Func,
        display: _LS("system.schema.appiscombinedisable"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                },
                {
                    name: "func",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                }
            ],
            exps: [],
            func: (type: string, func: string) => {
                if (!type || !func) return true
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
                return schema?.type !== SchemaType.Scalar && schema?.type !== SchemaType.Enum
            }
        }
    },
    {
        name: "system.schema.appiscombinesdisable",
        type: SchemaType.Func,
        display: _LS("system.schema.appiscombinesdisable"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                },
                {
                    name: "func",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                }
            ],
            exps: [],
            func: (type: string, func: string) => {
                if (!type || !func) return true
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array)
                    schema = schema.array?.element ? getCachedSchema(schema.array.element) : undefined
                return schema?.type !== SchemaType.Struct
            }
        }
    },
    {
        name: "system.schema.appistrackpushdisable",
        type: SchemaType.Func,
        display: _LS("system.schema.appistrackpushdisable"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                },
                {
                    name: "func",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                }
            ],
            exps: [],
            func: (type: string, func: string) => {
                if (!type || !func) return true
                return false
            }
        }
    },
    {
        name: "system.schema.appfieldschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.appfieldschema"),
        struct: {
            fields: [
                {
                    name: "app",
                    type: NS_SYSTEM_STRING,
                    readonly: true,
                    invisible: true,
                    display: _LS("system.schema.appfieldschema.app"),
                },
                {
                    name: "name",
                    require: true,
                    type: "system.schema.varname",
                    display: _LS("system.schema.appfieldschema.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "system.schema.valuetype",
                    display: _LS("system.schema.appfieldschema.type"),
                },
                {
                    name: "display",
                    type: "system.localestring",
                    display: _LS("system.schema.appfieldschema.display"),
                    upLimit: 64,
                },
                {
                    name: "desc",
                    type: "system.localestring",
                    display: _LS("system.schema.appfieldschema.desc"),
                    upLimit: 255,
                },
                {
                    name: "sourceApp",
                    type: "system.schema.app",
                    display: _LS("system.schema.appfieldschema.sourceapp"),
                },
                {
                    name: "sourceField",
                    type: "system.schema.appfield",
                    display: _LS("system.schema.appfieldschema.sourcefld"),
                },
                {
                    name: "trackPush",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.appfieldschema.trackpush"),
                },
                {
                    name: "incrUpdate",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.appfieldschema.incrupdate"),
                },
                {
                    name: "frontend",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.appfieldschema.frontend"),
                },
                {
                    name: "disable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.appfieldschema.disable"),
                },
                {
                    name: "readonly",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.appfieldschema.readonly"),
                },
                {
                    name: "func",
                    type: "system.schema.pushfunctype",
                    display: _LS("system.schema.appfieldschema.func"),
                },
                {
                    name: "args",
                    type: "system.schema.apppushflds",
                    display: _LS("system.schema.appfieldschema.args"),
                },
                {
                    name: "combine",
                    type: "system.schema.datacombinetype",
                    display: _LS("system.schema.appfieldschema.combine"),
                },
                {
                    name: "combines",
                    type: "system.schema.datacombines",
                    display: _LS("system.schema.arrayschema.combine"),
                },
            ],
            relations: [
                {
                    field: "name",
                    type: RelationType.Default,
                    func: "system.schema.appgetsourceappfldinfo",
                    args: [
                        {
                            name: "sourceApp"
                        },
                        {
                            name: "sourceField"
                        },
                        {
                            value: "name"
                        },
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "display",
                    type: RelationType.Default,
                    func: "system.schema.appgetsourceappfldinfo",
                    args: [
                        {
                            name: "sourceApp"
                        },
                        {
                            name: "sourceField"
                        },
                        {
                            value: "display"
                        },
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "desc",
                    type: RelationType.Default,
                    func: "system.schema.appgetsourceappfldinfo",
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
                    func: "system.schema.appgetsourceappfldinfo",
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
                    func: "system.schema.appgetsourceappblacklist",
                    args: [
                        {
                            name: "app"
                        }
                    ]
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
                {
                    field: "frontend",
                    type: RelationType.Invisible,
                    func: "system.logic.notnull",
                    args: [
                        {
                            name: "sourceApp"
                        }
                    ]
                },
                {
                    field: "combine",
                    type: RelationType.Invisible,
                    func: "system.schema.appiscombinedisable",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            name: "func"
                        }
                    ]
                },
                {
                    field: "combines",
                    type: RelationType.Invisible,
                    func: "system.schema.appiscombinesdisable",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            name: "func"
                        }
                    ]
                },
                {
                    field: "combines.field",
                    type: RelationType.WhiteList,
                    func: "system.schema.getstructnumbervaluefields",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "trackPush",
                    type: RelationType.Invisible,
                    func: "system.schema.appistrackpushdisable",
                    args: [
                        {
                            name: "sourceField"
                        },
                        {
                            name: "func"
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "system.schema.appnofields",
        type: SchemaType.Func,
        display: _LS("system.schema.appnofields"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "app",
                    type: "system.schema.app",
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
        name: "system.schema.appschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.appschema"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "system.schema.appinput",
                    display: _LS("system.schema.appschema.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "display",
                    type: "system.localestring",
                    display: _LS("system.schema.appschema.display"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: "system.localestring",
                    display: _LS("system.schema.appschema.desc"),
                    upLimit: 255,
                } as IStructScalarFieldConfig,
                {
                    name: "relations",
                    type: "system.schema.appfieldrelations",
                    display: _LS("system.schema.appschema.relations"),
                },
            ],
            relations: [
                {
                    field: "relations.fieldType",
                    type: RelationType.Default,
                    func: "system.schema.appgetfieldtype",
                    args: [
                        {
                            name: "name",
                        },
                        {
                            name: "relations.field"
                        }
                    ]
                },
                {
                    field: "relations",
                    type: RelationType.Invisible,
                    func: "system.schema.appnofields",
                    args: [
                        {
                            name: "name"
                        }
                    ]
                }
            ]
        }
    },

    //#region helper
    {
        name: "system.schema.appgetapptargets",
        type: SchemaType.Func,
        display: _LS("system.schema.appgetapptargets"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "app",
                    type: "system.schema.app",
                    nullable: true,
                }
            ],
            exps: [],
            func: (app: string) => {
                if (isNull(app)) return []
                const appTargets = JSON.parse(localStorage["schema_app_targets"] || "{}")
                if (appTargets && typeof(appTargets) === "object") {
                    return appTargets[app] || []
                }
                return []
            }
        }
    },
    {
        name: "system.schema.apptarget",
        type: SchemaType.Struct,
        display: _LS("system.schema.apptarget"),
        struct: {
            fields: [
                {
                    name: "allowApps",
                    type: NS_SYSTEM_STRINGS,
                    invisible: true,
                },
                {
                    name: "app",
                    type: "system.schema.app",
                    require: true,
                    display: _LS("system.schema.apptarget.app"),
                },
                {
                    name: "target",
                    type: NS_SYSTEM_STRING,
                    require: true,
                    display: _LS("system.schema.apptarget.target"),
                    asSuggest: true,
                    upLimit: 64
                } as IStructScalarFieldConfig,
            ],
            relations: [
                {
                    field: "app",
                    type: RelationType.WhiteList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "allowApps"
                        }
                    ]
                },
                {
                    field: "target",
                    type: RelationType.WhiteList,
                    func: "system.schema.appgetapptargets",
                    args: [
                        {
                            name: "app"
                        }
                    ]
                }
            ]
        }
    },
    //#endregion
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
    // only save custom schema in the cache
    if (schema.loadState && (schema.loadState & SchemaLoadState.Custom) == 0) return

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

// export app schema
export function appSchemaToJson(f: IAppSchema, types?: string[]): IAppSchema
{
    const r: IAppSchema = { name: f.name, display: f.display, desc: f.desc }
    const isroot = isNull(types)
    types ||= []

    if (f.apps?.length)
    {
        r.apps = f.apps.map((a: IAppSchema) => appSchemaToJson(a, types))
    }
    else if(f.fields?.length)
    {
        r.fields = deepClone(f.fields, true)
        r.relations = deepClone(f.relations, true)

        r.fields?.forEach((f:IAppFieldSchema) => { if (!types.includes(f.type)) types.push(f.type) })
        r.relations?.forEach((r:IStructFieldRelation) => { if (!types.includes(r.func)) types.push(r.func) })
    }

    if (isroot && types?.length)
    {
        r.nodeSchemas = []
        types.forEach(t => gatherSchemas(r.nodeSchemas!, t))
    }

    return r
}

function gatherSchemas(types: INodeSchema[], name?: string)
{
    if (!name) return
    const schema = getCachedSchema(name)
    if (!schema || ((schema.loadState || 0) & SchemaLoadState.System)) return

    const access = name.split(".").filter(n => !isNull(n))

    let schemas: INodeSchema[] = types
    for (let i = 1; i < access.length; i++)
    {
        const ns = access.slice(0, i).join(".")
        const exist: INodeSchema | undefined = schemas?.find(s => s.name === ns)
        if (exist)
        {
            exist.schemas ||= []
            schemas = exist.schemas
        }
        else
        {
            const schema = getCachedSchema(ns)
            if (!schema) return
            const json: INodeSchema = { name: schema.name, type: schema.type, display: deepClone(schema.display), schemas: [] }
            schemas.push(json)
            schemas = json.schemas!
        }
    }
    if (schemas.findIndex(s => s.name === name) >= 0) return

    const r: INodeSchema = { name: schema.name, type: schema.type, display: deepClone(schema.display) }
    schemas.push(r)

    switch (schema.type)
    {
        case SchemaType.Scalar:
        {
            r.scalar = deepClone(schema.scalar, true)
            gatherSchemas(types, r.scalar?.base)
            gatherSchemas(types, r.scalar?.preValid)
            gatherSchemas(types, r.scalar?.postValid)
            break
        }
        case SchemaType.Enum:
        {
            r.enum = deepClone(schema.enum, true)
            if ((schema.loadState || 0) & SchemaLoadState.Server)
                r.enum!.values = []
            break
        }
        case SchemaType.Struct:
        {
            r.struct = deepClone(schema.struct, true)
            r.struct?.fields?.forEach((f: IStructFieldConfig) => gatherSchemas(types, f.type))
            r.struct?.relations?.forEach((r: IStructFieldRelation) => gatherSchemas(types, r.func))
            break
        }
        case SchemaType.Array:
        {
            r.array = deepClone(schema.array, true)
            gatherSchemas(types, r.array?.element)
            r.array?.relations?.forEach((r: IStructFieldRelation) => gatherSchemas(types, r.func))
            break
        }
        case SchemaType.Func:
        {
            r.func = { ...deepClone(schema.func!, true), func: undefined }
            if (!r.func!.exps) r.func!.exps = []
            if (!r.func!.args) r.func!.args = []

            gatherSchemas(types, r.func?.return)
            r.func?.args?.forEach((a: IFunctionArgumentInfo) => gatherSchemas(types, a.type))
            r.func?.exps?.forEach((e: IFunctionExpression) => gatherSchemas(types, e.func))
            break
        }
    }
}

export function addAppTarget(app: string, target: string)
{
    if (isNull(app) || isNull(target)) return

    let appTargets = JSON.parse(localStorage["schema_app_targets"] || "{}")
    if (isNull(appTargets) || typeof(appTargets) !== "object") appTargets = {}
    
    let targets: string[] = appTargets[app] || []
    if (!Array.isArray(targets)) targets = []
    if (!targets.includes(target)) {
        targets.unshift(target)
        appTargets[app] = targets
        localStorage["schema_app_targets"] = JSON.stringify(appTargets)
    }
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

regSchemaTypeView("system.schema.app", sourceappView)
regSchemaTypeView("system.schema.appinput", appInputView)
regSchemaTypeView("system.schema.appfield", appsrcfldView)
regSchemaTypeView("system.schema.appaccessfld", appaccessfldView)
regSchemaTypeView("system.schema.apppushfld", appaccessfldView)
regSchemaTypeView("system.schema.apppushflds", appPushfldsView)
regSchemaTypeView("system.schema.appfieldrelations", structfldrelationinfosView)
regSchemaTypeView("system.schema.appfieldvalargs", structfldfuncargsView)
//#endregion