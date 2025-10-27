import { _L, _LS, ARRAY_ELEMENT, ARRAY_ITSELF, deepClone, EnumValueType, ExpressionType, getArraySchema, getCachedSchema, getSchema, isNull, isSchemaCanBeUseAs, isStructFieldIndexable, NS_SYSTEM_ARRAY, NS_SYSTEM_BOOL, NS_SYSTEM_INT, NS_SYSTEM_INTS, NS_SYSTEM_NUMBER, NS_SYSTEM_STRING, NS_SYSTEM_STRINGS, registerSchema, RelationType, SchemaLoadState, SchemaType, type ILocaleString, type INodeSchema, type IStructEnumFieldConfig, type IStructFieldConfig, type IStructScalarFieldConfig } from "schema-node"

// Schema for definition
registerSchema([
    //#region scalar type
    {
        name: "system.schema.pushfunctype",
        type: SchemaType.Scalar,
        display: _LS("system.schema.pushfunctype"),
        scalar: {
            base: "system.schema.functype",
        }
    },
    {
        name: "system.schema.namespaceinput",
        type: SchemaType.Scalar,
        display: _LS("system.schema.namespaceinput"),
        scalar: {
            base: NS_SYSTEM_STRING,
            upLimit: 128,
            regex: "^[a-z]\\w*(\.[a-z]\\w*)*$",
        }
    },
    {
        name: "system.schema.reltarfield",
        type: SchemaType.Scalar,
        display: _LS("system.schema.reltarfield"),
        scalar: {
            base: NS_SYSTEM_STRING,
            upLimit: 128,
        }
    },
    //#endregion

    //#region scalar definition
    {
        name: "system.schema.scalarschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.scalarschema"),
        struct: {
            fields: [
                {
                    name: "base",
                    require: true,
                    type: "system.schema.scalartype",
                    display: _LS("system.schema.scalarschema.base"),
                },
                {
                    name: "unit",
                    type: "system.localestring",
                    display: _LS("system.schema.scalarschema.unit"),
                    upLimit: 8,
                } as IStructScalarFieldConfig,
                {
                    name: "lowLimit",
                    type: NS_SYSTEM_NUMBER,
                    display: _LS("system.schema.scalarschema.lowlimit"),
                },
                {
                    name: "upLimit",
                    type: NS_SYSTEM_NUMBER,
                    display: _LS("system.schema.scalarschema.uplimit"),
                },
                {
                    name: "error",
                    type: "system.localestring",
                    display: _LS("system.schema.scalarschema.error"),
                    upLimit: 128,
                },
                {
                    name: "regex",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.scalarschema.regex"),
                },
                {
                    name: "whiteList",
                    type: "system.schema.whitelistfunc",
                    display: _LS("system.schema.scalarschema.whitelist")
                },
                {
                    name: "asSuggest",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.assuggest")
                },
                {
                    name: "preValid",
                    type: "system.schema.validfunc",
                    display: _LS("system.schema.scalarschema.prevalid"),
                } as IStructScalarFieldConfig,
                {
                    name: "postValid",
                    type: "system.schema.validfunc",
                    display: _LS("system.schema.scalarschema.postvalid"),
                },
            ],
            relations: [
                {
                    field: "whiteList",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    field: "preValid",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    field: "postValid",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "base"
                        }
                    ]
                }
            ]
        },
    },
    //#endregion

    //#region enum definition
    {
        name: "system.schema.enumvalueinfo",
        type: SchemaType.Struct,
        display: _LS("system.schema.enumvalueinfo"),
        struct: {
            fields: [
                {
                    name: "value",
                    require: true,
                    immutable: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.enumvalueinfo.value"),
                } as IStructScalarFieldConfig,
                {
                    name: "name",
                    require: true,
                    type: "system.localestring",
                    display: _LS("system.schema.enumvalueinfo.name"),
                    upLimit: 64
                },
                {
                    name: "disable",
                    default: false,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.enumvalueinfo.disable"),
                }
            ]
        },
    },
    {
        name: "system.schema.enumvalueinfos",
        type: SchemaType.Array,
        display: _LS("system.schema.enumvalueinfos"),
        array: {
            element: "system.schema.enumvalueinfo",
            primary: ["value"],
        },
    },
    {
        name: "system.schema.enumintvalueinfo",
        type: SchemaType.Struct,
        display: _LS("system.schema.enumvalueinfo"),
        struct: {
            fields: [
                {
                    name: "value",
                    require: true,
                    immutable: true,
                    type: NS_SYSTEM_INT,
                    display: _LS("system.schema.enumvalueinfo.value"),
                } as IStructScalarFieldConfig,
                {
                    name: "name",
                    require: true,
                    type: "system.localestring",
                    display: _LS("system.schema.enumvalueinfo.name"),
                    upLimit: 64
                },
                {
                    name: "disable",
                    default: false,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.enumvalueinfo.disable"),
                }
            ]
        },
    },
    {
        name: "system.schema.enumintvalueinfos",
        type: SchemaType.Array,
        display: _LS("system.schema.enumvalueinfos"),
        array: {
            element: "system.schema.enumintvalueinfo",
            primary: ["value"],
        },
    },
    {
        name: "system.schema.enumflagvalueinfo",
        type: SchemaType.Struct,
        display: _LS("system.schema.enumvalueinfo"),
        struct: {
            fields: [
                {
                    name: "value",
                    require: true,
                    immutable: true,
                    readonly: true,
                    type: NS_SYSTEM_INT,
                    display: _LS("system.schema.enumvalueinfo.value"),
                } as IStructScalarFieldConfig,
                {
                    name: "name",
                    require: true,
                    type: "system.localestring",
                    display: _LS("system.schema.enumvalueinfo.name"),
                    upLimit: 64
                },
                {
                    name: "disable",
                    default: false,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.enumvalueinfo.disable"),
                }
            ]
        },
    },
    {
        name: "system.schema.enumflagsvalueinfos",
        type: SchemaType.Array,
        display: _LS("system.schema.enumvalueinfos"),
        array: {
            element: "system.schema.enumflagvalueinfo",
            primary: ["value"],
            relations: [
                {
                    field: "value",
                    type: RelationType.Assign,
                    func: "system.schema.calcnextflag",
                    args: [
                        {
                            "name": ARRAY_ITSELF
                        }
                    ]
                }
            ]
        },
    },
    {
        name: "system.schema.calcnextflag",
        type: SchemaType.Func,
        display: _LS("system.schema.calcnextflag"),
        func: {
            return: NS_SYSTEM_INT,
            args: [
                {
                    name: "values",
                    type: NS_SYSTEM_INTS,
                }
            ],
            exps: [],
            func: (values: any[]) => {
                if (!Array.isArray(values) || values.length == 0) return 0
                const last = values[values.length - 1]
                return !last?.value ? 1 : last.value * 2
            }
        }
    },
    {
        name: "system.schema.getenuminfostype",
        type: SchemaType.Func,
        display: _LS("system.schema.getenuminfostype"),
        func: {
            return: "system.schema.arraytype",
            args: [
                {
                    name: "type",
                    type: "system.schema.enumvaluetype"
                }
            ],
            exps: [],
            func: (type: EnumValueType) => {
                switch (type)
                {
                    case EnumValueType.String:
                        return "system.schema.enumvalueinfos"
                    case EnumValueType.Int:
                        return "system.schema.enumintvalueinfos"
                    case EnumValueType.Flags:
                        return "system.schema.enumflagsvalueinfos"
                }
            }
        }
    },
    {
        name: "system.schema.enumschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.enumschema"),
        struct: {
            fields: [
                {
                    name: "type",
                    require: true,
                    type: "system.schema.enumvaluetype",
                    display: _LS("system.schema.enumschema.type"),
                    default: EnumValueType.Int,
                },
                {
                    name: "cascade",
                    type: "system.localestrings",
                    display: _LS("system.schema.enumschema.cascade"),
                },
                {
                    name: "values",
                    type: "system.schema.enumvalueinfos",
                    display: _LS("system.schema.enumschema.values"),
                },
            ],
            relations: [
                {
                    field: "cascade",
                    type: RelationType.Invisible,
                    func: "system.logic.equal",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            value: EnumValueType.Flags
                        }
                    ]
                },
                {
                    field: "values",
                    type: RelationType.Type,
                    func: "system.schema.getenuminfostype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                }
            ]
        }
    },
    //#endregion

    //#region struct definition
    {
        name: "system.schema.isvaluenotnull",
        type: SchemaType.Func,
        display: _LS("system.schema.isvaluenotnull"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "value",
                    type: "system.schema.anyvalue"
                }
            ],
            exps: [],
            func: (value: any) => {
                if (Array.isArray(value)) return value.length ? true : false
                if (value && typeof(value) === "object") return Object.getOwnPropertyNames(value).length ? true : false
                return !isNull(value)
            }
        }
    },
    {
        name: "system.schema.getexpvaluetype",
        type: SchemaType.Func,
        display: _LS("system.schema.getexpvaluetype"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: async(type: string) => {
                let schema = await getSchema(type)
                if (schema?.type === SchemaType.Array) schema = schema.array?.element ? await getSchema(schema.array.element) : undefined
                if (schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum) return type
                return NS_SYSTEM_STRING
            }
        }
    },
    {
        name: "system.schema.hideexpvalue",
        type: SchemaType.Func,
        display: _LS("system.schema.hideexpvalue"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                },
                {
                    name: "name",
                    type: NS_SYSTEM_STRING
                }
            ],
            exps: [],
            func: async(type: string, name: string) => {
                let schema = await getSchema(type)
                if (schema?.type === SchemaType.Array) schema = schema.array?.element ? await getSchema(schema.array.element) : undefined
                if (schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum) return !isNull(name)
                return true
            }
        }
    },
    {
        name: "system.schema.structfldfuncarg",
        type: SchemaType.Struct,
        display: _LS("system.schema.structfldfuncarg"),
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
                    displayOnly: true,
                    display: _LS("system.schema.structfldfuncarg.type"),
                },
                {
                    name: "name",
                    type: "system.schema.reltarfield",
                    display: _LS("system.schema.structfldfuncarg.name"),
                },
                {
                    name: "value",
                    type: "system.schema.anyvalue",
                    display: _LS("system.schema.structfldfuncarg.value"),
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
        name: "system.schema.structfldfuncargs",
        type: SchemaType.Array,
        display: _LS("system.schema.structfldfuncargs"),
        array: {
            element: "system.schema.structfldfuncarg",
        },
    },
    {
        name: "system.schema.notscalartype",
        type: SchemaType.Func,
        display: _LS("system.schema.notscalartype"),
        func: {
            return : NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: (type: string) => {
                const schema = getCachedSchema(type)
                return schema?.type !== SchemaType.Scalar
            }
        }
    },
    {
        name: "system.schema.notenumtype",
        type: SchemaType.Func,
        display: _LS("system.schema.notenumtype"),
        func: {
            return : NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: (type: string) => {
                const schema = getCachedSchema(type)
                return schema?.type !== SchemaType.Enum
            }
        }
    },
    {
        name: "system.schema.notscalarenumtype",
        type: SchemaType.Func,
        display: _LS("system.schema.notscalarenumtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype",
                    nullable: true,
                }
            ],
            exps: [],
            func: (type: string) => {
                let schema = type ? getCachedSchema(type) : null
                if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
                return schema?.type !== SchemaType.Scalar && schema?.type !== SchemaType.Enum
            }
        }
    },
    {
        name: "system.schema.notcascadeenumtype",
        type: SchemaType.Func,
        display: _LS("system.schema.notcascadeenumtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args:[
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: (type: string) => {
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
                return schema?.type !== SchemaType.Enum || !schema.enum?.cascade || schema.enum.cascade.length <= 1
            }
        }
    },
    {
        name: "system.schema.getroottype",
        type: SchemaType.Func,
        display: _LS("system.schema.getroottype"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: (type: string) => {
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
                return schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum ? schema?.name : NS_SYSTEM_STRING
            }
        }
    },
    {
        name: "system.schema.notflagsenumtype",
        type: SchemaType.Func,
        display: _LS("system.schema.notflagsenumtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: (type: string) => {
                const schema = getCachedSchema(type)
                return schema?.type !== SchemaType.Enum || schema.enum?.type !== EnumValueType.Flags
            }
        }
    },
    {
        name: "system.schema.getenumcascadewhitelist",
        type: SchemaType.Func,
        display: _LS("system.schema.getenumcascadewhitelist"),
        func: {
            return: NS_SYSTEM_ARRAY,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: (type: string) => {
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
                if (schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1) {
                    return schema.enum.cascade.map((item: ILocaleString, i: number) => ({
                        value: i + 1,
                        label: _L(item)
                    }))
                }
                return null
            }
        }
    },
    {
        name: "system.schema.noenumroot",
        type: SchemaType.Func,
        display: _LS("system.schema.noenumroot"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                },
                {
                    name: "cascade",
                    type: NS_SYSTEM_INT,
                    nullable: true
                }
            ],
            exps: [],
            func: (type: string, cascade?: number) => {                
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
                if (schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1) {
                    return cascade === 1
                }
                return true
            }
        }
    },
    {
        name: "system.schema.getenumrootcascade",
        type: SchemaType.Func,
        display: _LS("system.schema.getenumrootcascade"),
        func: {
            return: NS_SYSTEM_INT,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                },
                {
                    name: "cascade",
                    type: NS_SYSTEM_INT,
                    nullable: true
                }
            ],
            exps: [],
            func: (type: string, cascade?: number) => {
                if (cascade) return cascade - 1
                
                let schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
                if (schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1) {
                    return schema.enum.cascade.length - 1
                }
                return 0
            }
        }
    },
    {
        name: "system.schema.getwhiteblacklisttype",
        type: SchemaType.Func,
        display: _LS("system.schema.getwhiteblacklisttype"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: async (type: string) => {
                const schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Array || schema?.type === SchemaType.Struct) return NS_SYSTEM_STRING
                
                const arraySchema = await getArraySchema(type)
                return arraySchema?.name
            }
        }
    },
    {
        name: "system.schema.getscalarorenumtype",
        type: SchemaType.Func,
        display: _LS("system.schema.getscalarorenumtype"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: async (type: string) => {
                const schema = getCachedSchema(type)
                return schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum ? type : NS_SYSTEM_STRING
            }
        }
    },
    {
        name: "system.schema.structfieldconfig",
        type: SchemaType.Struct,
        display: _LS("system.schema.structfieldconfig"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "system.schema.varname",
                    display: _LS("system.schema.structfieldconfig.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "system.schema.valuetype",
                    display: _LS("system.schema.structfieldconfig.type"),
                },
                {
                    name: "display",
                    type: "system.localestring",
                    display: _LS("system.schema.structfieldconfig.display"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: "system.localestring",
                    display: _LS("system.schema.structfieldconfig.desc"),
                    upLimit: 255,
                } as IStructScalarFieldConfig,
                {
                    name: "error",
                    type: "system.localestring",
                    display: _LS("system.schema.structfieldconfig.error"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "require",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.require"),
                },
                {
                    name: "immutable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.immutable"),
                },
                {
                    name: "readonly",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.readonly"),
                },
                {
                    name: "invisible",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.invisible"),
                },
                {
                    name: "displayOnly",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.displayonly"),
                },
                {
                    name: "unit",
                    type: "system.localestring",
                    display: _LS("system.schema.structfieldconfig.unit"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "default",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.structfieldconfig.default"),
                    asSuggest: true,
                },

                // scalar config
                {
                    name: "whiteList",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("system.schema.structfieldconfig.whitelist"),
                    anyLevel: true
                } as IStructEnumFieldConfig,
                {
                    name: "blackList",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("system.schema.structfieldconfig.blacklist"),
                    anyLevel: true,
                } as IStructEnumFieldConfig,
                {
                    name: "lowLimit",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.structfieldconfig.lowlimit"),
                },
                {
                    name: "upLimit",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.structfieldconfig.uplimit"),
                },
                {
                    name: "asSuggest",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.assuggest"),
                },
                {
                    name: "useOriginForUpLimit",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.useoriginforuplimit"),
                },

                // enum config
                {
                    name: "cascade",
                    type: NS_SYSTEM_INT,
                    display: _LS("system.schema.structfieldconfig.cascade"),
                },
                {
                    name: "root",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.structfieldconfig.root"),
                    anyLevel: true,
                } as IStructEnumFieldConfig,
                {
                    name: "anyLevel",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.anylevel"),
                },
                {
                    name: "singleFlag",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.structfieldconfig.singleflag"),
                },
            ],
            relations: [
                // default
                {
                    field: "default",
                    type: RelationType.Invisible,
                    func: "system.schema.notscalarenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.Type,
                    func: "system.schema.getscalarorenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.WhiteList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "whiteList"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.BlackList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "blackList"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "root"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.AnyLevel,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "anyLevel"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.Cascade,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "cascade"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.SingleFlag,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "singleFlag"
                        }
                    ]
                },

                // white list
                {
                    field: "whiteList",
                    type: RelationType.Invisible,
                    func: "system.schema.notscalarenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "whiteList",
                    type: RelationType.Type,
                    func: "system.schema.getwhiteblacklisttype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "whiteList",
                    type: RelationType.BlackList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "blackList"
                        }
                    ]
                },
                {
                    field: "whiteList",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "root"
                        }
                    ]
                },
                {
                    field: "whiteList",
                    type: RelationType.Cascade,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "cascade"
                        }
                    ]
                },
                {
                    field: "blackList",
                    type: RelationType.Invisible,
                    func: "system.schema.notscalarenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "blackList",
                    type: RelationType.Type,
                    func: "system.schema.getwhiteblacklisttype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "blackList",
                    type: RelationType.Root,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "root"
                        }
                    ]
                },
                {
                    field: "blackList",
                    type: RelationType.Cascade,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "cascade"
                        }
                    ]
                },
                {
                    field: "lowLimit",
                    type: RelationType.Invisible,
                    func: "system.schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "upLimit",
                    type: RelationType.Invisible,
                    func: "system.schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "asSuggest",
                    type: RelationType.Invisible,
                    func: "system.schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "useOriginForUpLimit",
                    type: RelationType.Invisible,
                    func: "system.schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "cascade",
                    type: RelationType.Invisible,
                    func: "system.schema.notcascadeenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "cascade",
                    type: RelationType.WhiteList,
                    func: "system.schema.getenumcascadewhitelist",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "root",
                    type: RelationType.Invisible,
                    func: "system.schema.noenumroot",
                    args: [
                        {
                            name: "type",
                        },
                        {
                            name: "cascade"
                        }
                    ]
                },
                {
                    field: "root",
                    type: RelationType.Type,
                    func: "system.schema.getroottype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "root",
                    type: RelationType.Cascade,
                    func: "system.schema.getenumrootcascade",
                    args: [
                        {
                            name: "type",
                        },
                        {
                            name: "cascade"
                        }
                    ]
                },
                {
                    field: "anyLevel",
                    type: RelationType.Invisible,
                    func: "system.schema.notcascadeenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "singleFlag",
                    type: RelationType.Invisible,
                    func: "system.schema.notflagsenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "system.schema.structfieldconfigs",
        type: SchemaType.Array,
        display: _LS("system.schema.structfieldconfigs"),
        array: {
            element: "system.schema.structfieldconfig",
            primary: ["name"],
        },
    },
    {
        name: "system.schema.getstructindexfields",
        type: SchemaType.Func,
        display: _LS("system.schema.getstructindexfields"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: async (type: string) => {
                const schema = type ? await getSchema(type) : null
                const indexes: string[] = []

                if (schema?.struct?.fields)
                {
                    for (let i = 0; i < schema.struct.fields.length; i++) {
                        if (await isStructFieldIndexable(schema.struct.fields[i] as IStructFieldConfig)) {
                            indexes.push(schema.struct.fields[i].name)
                        }
                    }
                }

                return indexes
            }
        }
    },
    {
        name: "system.schema.getstructnumbervaluefields",
        type: SchemaType.Func,
        display: _LS("system.schema.getstructnumbervaluefields"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                }
            ],
            exps: [],
            func: async (type: string) => {
                let schema = type ? await getSchema(type) : null
                if (schema?.type === SchemaType.Array && schema.array?.element)
                    schema = await getSchema(schema.array.element)

                const values: string[] = []
                if (schema?.struct?.fields)
                {
                    for (let i = 0; i < schema.struct.fields.length; i++) {
                        const field = schema!.struct!.fields[i]
                        if (await isSchemaCanBeUseAs(field.type, NS_SYSTEM_NUMBER))
                            values.push(field.name)
                    }
                }

                return values
            }
        }
    },
    {
        name: "system.schema.getrelationfuncreturn",
        type: SchemaType.Func,
        display: _LS("system.schema.getrelationfuncreturn"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "fieldType",
                    type: "system.schema.valuetype"
                },
                {
                    name: "relationType",
                    type: "system.schema.relationtype"
                }
            ],
            exps: [],
            func: async (fieldType: string, type: any) => {
                switch (type) {
                    case RelationType.Default:
                    case RelationType.Assign:
                    case RelationType.InitOnly:
                    case RelationType.Root:
                        return fieldType

                    case RelationType.WhiteList:
                    case RelationType.BlackList:
                        const arraySchema = await getArraySchema(fieldType)
                        return arraySchema?.name || NS_SYSTEM_ARRAY

                    case RelationType.LowLimit:
                    case RelationType.UpLimit:
                        if (await isSchemaCanBeUseAs(NS_SYSTEM_STRING, fieldType))
                            return NS_SYSTEM_INT
                        return fieldType

                    case RelationType.Type:
                        return "system.schema.valuetype"

                    case RelationType.Cascade:
                        return NS_SYSTEM_INT

                    case RelationType.Invisible:
                    case RelationType.Visible:
                    case RelationType.Disable:
                    case RelationType.AnyLevel:
                    case RelationType.SingleFlag:
                        return NS_SYSTEM_BOOL

                }
            }
        }
    },
    {
        name: "system.schema.getrelationwhitelist",
        type: SchemaType.Func,
        display: _LS("system.schema.getrelationwhitelist"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "fieldType",
                    type: NS_SYSTEM_STRING
                }
            ],
            exps: [],
            func: async (fieldType: string) => {
                if (!fieldType) return []
                const typeInfo = fieldType ? await getSchema(fieldType) : null
                if (typeInfo?.type === SchemaType.Scalar) {
                    return [
                        RelationType.Default,
                        RelationType.Root,
                        RelationType.WhiteList,
                        RelationType.BlackList,
                        RelationType.LowLimit,
                        RelationType.UpLimit,
                        RelationType.Invisible,
                        RelationType.Visible,
                        RelationType.Disable,
                        RelationType.Assign,
                        RelationType.InitOnly,
                        RelationType.Type,
                        RelationType.Validation
                    ]
                }
                else if (typeInfo?.type === SchemaType.Enum) {
                    return [
                        RelationType.Default,
                        RelationType.Root,
                        RelationType.WhiteList,
                        RelationType.BlackList,
                        RelationType.Invisible,
                        RelationType.Visible,
                        RelationType.Disable,
                        RelationType.Assign,
                        RelationType.InitOnly,
                        RelationType.Type,
                        RelationType.AnyLevel,
                        RelationType.Cascade,
                        RelationType.SingleFlag,
                        RelationType.Validation
                    ]
                }
                else if (typeInfo?.type === SchemaType.Struct) {
                    return [
                        RelationType.Invisible,
                        RelationType.Visible,
                        RelationType.Disable,
                        RelationType.Assign,
                        RelationType.Type
                    ]
                }
                return [
                    RelationType.Default,
                    RelationType.Root,
                    RelationType.WhiteList,
                    RelationType.BlackList,
                    RelationType.Invisible,
                    RelationType.Visible,
                    RelationType.Disable,
                    RelationType.Assign,
                    RelationType.InitOnly,
                    RelationType.Type,
                    RelationType.AnyLevel,
                    RelationType.Cascade,
                    RelationType.Validation
                ]
            }
        }
    },
    {
        name: "system.schema.getstructfieldtype",
        type: SchemaType.Func,
        display: _LS("system.schema.getstructfieldtype"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING
                },
                {
                    name: "fields",
                    type: "system.schema.structfieldconfigs"
                }
            ],
            exps: [],
            func: async (field: string, fields: any[]) => {
                const paths = (field || "").split(".")
                if (paths.length === 0) return null
                let tarField = (fields || []).find(p => p.name === paths[0])
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
                        tarField = null
                    }
                }
                return tarField?.type
            }
        }
    },
    {
        name: "system.schema.getstructfieldtypebytype",
        type: SchemaType.Func,
        display: _LS("system.schema.getstructfieldtypebytype"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype"
                },
                {
                    name: "field",
                    type: NS_SYSTEM_STRING
                },
            ],
            exps: [],
            func: async (type: string, field: string) => {
                const paths = (field || "").split(".")
                if (paths.length === 0) return null

                let schema = await getSchema(type)
                if (!schema) return null
                let tarField = schema.struct?.fields.find((p: IStructFieldConfig) => p.name === paths[0])
                for (let i = 1; i < paths.length; i++) {
                    if (!tarField) return null

                    schema = await getSchema(tarField.type)
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
        name: "system.schema.structfieldrelation",
        type: SchemaType.Struct,
        display: _LS("system.schema.structfieldrelation"),
        struct: {
            fields: [
                {
                    name: "field",
                    require: true,
                    type: "system.schema.reltarfield",
                    display: _LS("system.schema.structfieldrelation.field"),
                },
                {
                    name: "fieldType",
                    displayOnly: true,
                    invisible: true,
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
                    display: _LS("system.schema.structfieldrelation.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "system.schema.functype",
                    display: _LS("system.schema.structfieldrelation.func"),
                },
                {
                    name: "args",
                    type: "system.schema.structfldfuncargs",
                    display: _LS("system.schema.structfieldrelation.args"),
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
        name: "system.schema.structfieldrelations",
        type: SchemaType.Array,
        display: _LS("system.schema.structfieldrelations"),
        array: {
            element: "system.schema.structfieldrelation",
            primary: ["field", "type"],
        },
    },
    {
        name: "system.schema.structschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.structschema"),
        struct: {
            fields: [
                {
                    name: "base",
                    type: "system.schema.structtype",
                    display: _LS("system.schema.structschema.base"),
                },
                {
                    name: "fields",
                    require: true,
                    type: "system.schema.structfieldconfigs",
                    display: _LS("system.schema.structschema.fields"),
                },
                {
                    name: "relations",
                    type: "system.schema.structfieldrelations",
                    display: _LS("system.schema.structschema.relations"),
                },
            ],
            relations: [
                {
                    field: "relations.fieldType",
                    type: RelationType.Default,
                    func: "system.schema.getstructfieldtype",
                    args: [
                        {
                            name: "relations.field"
                        },
                        {
                            name: "fields"
                        }
                    ]
                },
            ]
        }
    },
    //#endregion

    //#region array definition
    {
        name: "system.schema.notstructtype",
        type: SchemaType.Func,
        display: _LS("system.schema.notstructtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype",
                    nullable: true,
                }
            ],
            exps: [],
            func: async (type: string) => {
                if (!type) return true
                const schema = await getSchema(type)
                return schema?.type !== SchemaType.Struct
            }
        }
    },
    {
        name: "system.schema.notstructarraytype",
        type: SchemaType.Func,
        display: _LS("system.schema.notstructarraytype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype",
                    nullable: true
                }
            ],
            exps: [],
            func: async (type: string) => {
                if (!type) return true
                let schema = await getSchema(type)
                if (schema?.type === SchemaType.Array)
                    schema = schema.array?.element ? await getSchema(schema.array.element) : undefined
                return schema?.type !== SchemaType.Struct
            }
        }
    },
    {
        name: "system.schema.datacombine",
        type: SchemaType.Struct,
        display: _LS("system.schema.datacombine"),
        struct: {
            fields: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.datacombine.field")
                },
                {
                    name: "type",
                    type: "system.schema.datacombinetype",
                    display: _LS("system.schema.datacombine.type")
                }
            ]
        }
    },
    {
        name: "system.schema.datacombines",
        type: SchemaType.Array,
        display: _LS("system.schema.datacombines"),
        array: {
            element: "system.schema.datacombine",
            primary: ["field"]
        }
    },
    {
        name: "system.schema.dataindex",
        type: SchemaType.Struct,
        display: _LS("system.schema.dataindex"),
        struct: {
            fields: [
                {
                    name: "name",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.dataindex.name"),
                    upLimit: 16,
                } as IStructScalarFieldConfig,
                {
                    name: "fields",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("system.schema.dataindex.fields"),
                }
            ],
            relations: [
                {
                    field: "fields.$ele",
                    type: RelationType.BlackList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "fields"
                        }
                    ]
                },
            ]
        }
    },
    {
        name: "system.schema.dataindexes",
        type: SchemaType.Array,
        display: _LS("system.schema.dataindexes"),
        array: {
            element: "system.schema.dataindex",
            primary: ["name"]
        }
    },
    {
        name: "system.schema.arrayschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.arrayschema"),
        struct: {
            fields: [
                {
                    name: "element",
                    type: "system.schema.arrayeletype",
                    display: _LS("system.schema.arrayschema.element"),
                },
                {
                    name: "single",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.arrayschema.single"),
                },
                {
                    name: "primary",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("system.schema.arrayschema.primary"),
                },
                {
                    name: "indexes",
                    type: "system.schema.dataindexes",
                    display: _LS("system.schema.dataindexes")
                },
                {
                    name: "combines",
                    type: "system.schema.datacombines",
                    display: _LS("system.schema.arrayschema.combine"),
                },
                {
                    name: "relations",
                    type: "system.schema.structfieldrelations",
                    display: _LS("system.schema.structschema.relations"),
                },
            ],
            relations: [
                {
                    field: "primary",
                    type: RelationType.Invisible,
                    func: "system.schema.notstructtype",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "primary.$ele",
                    type: RelationType.WhiteList,
                    func: "system.schema.getstructindexfields",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "primary.$ele",
                    type: RelationType.BlackList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "primary"
                        }
                    ]
                },
                {
                    field: "indexes",
                    type: RelationType.Invisible,
                    func: "system.schema.notstructtype",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "indexes.fields.$ele",
                    type: RelationType.WhiteList,
                    func: "system.schema.getstructindexfields",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "combines",
                    type: RelationType.Invisible,
                    func: "system.schema.notstructtype",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "combines.field",
                    type: RelationType.WhiteList,
                    func: "system.schema.getstructnumbervaluefields",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "relations.fieldType",
                    type: RelationType.Default,
                    func: "system.schema.getstructfieldtypebytype",
                    args: [
                        {
                            name: "element"
                        },
                        {
                            name: "relations.field"
                        }
                    ]
                },
            ]
        }
    },
    //#endregion

    //#region function definition
    {
        name: "system.schema.gettypedisplayorname",
        type: SchemaType.Func,
        display: _LS("system.schema.gettypedisplayorname"),
        func: {
            return: NS_SYSTEM_STRING,
            args: [
                {
                    name: "type",
                    type: "system.schema.valuetype",
                }
            ],
            exps: [],
            func: async (type: string) => {
                const schema = type ? await getSchema(type) : null
                if (!schema) return null
                return schema.display?.key ? _L(schema.display) : schema.name.split('.').pop()
            }
        }
    },
    {
        name: "system.schema.funcarg",
        type: SchemaType.Struct,
        display: _LS("system.schema.funcarg"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.funcarg.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "system.schema.valuetype",
                    display: _LS("system.schema.funcarg.type"),
                },
                {
                    name: "nullable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.funcarg.nullable"),
                }
            ],
            relations: [
                {
                    field: "name",
                    type: RelationType.Default,
                    func: "system.schema.gettypedisplayorname",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "system.schema.funcargs",
        type: SchemaType.Array,
        display: _LS("system.schema.funcargs"),
        array: {
            element: "system.schema.funcarg",
        },
    },
    {
        name: "system.schema.funccallarg",
        type: SchemaType.Struct,
        display: _LS("system.schema.funccallarg"),
        struct: {
            fields: [
                {
                    name: "display",
                    type: NS_SYSTEM_STRING,
                    displayOnly: true,
                    display: _LS("system.schema.funccallarg.display"),
                },
                {
                    name: "type",
                    type: "system.schema.valuetype",
                    displayOnly: true,
                    invisible: true,
                    display: _LS("system.schema.structfldfuncarg.type"),
                },
                {
                    name: "name",
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.funccallarg.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "value",
                    type: "system.schema.anyvalue",
                    display: _LS("system.schema.funccallarg.value"),
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
        name: "system.schema.funccallargs",
        type: SchemaType.Array,
        display: _LS("system.schema.funccallargs"),
        array: {
            element: "system.schema.funccallarg",
        },
    },
    {
        name: "system.schema.getcalltypewhitelist",
        type: SchemaType.Func,
        display: _LS("system.schema.getcalltypewhitelist"),
        func: {
            return: NS_SYSTEM_ARRAY,
            args: [
                {
                    name: "return",
                    type: "system.schema.valuetype"
                },
            ],
            exps: [],
            func: async (ret: string) => {
                const schema = ret ? await getSchema(ret) : null
                if (schema?.type === SchemaType.Array)
                {
                    return [
                        ExpressionType.Call,
                        ExpressionType.Filter,
                        ExpressionType.Map
                    ]
                }
                return [
                    ExpressionType.Call,
                    ExpressionType.First,
                    ExpressionType.Last,
                    ExpressionType.Reduce
                ]
            }
        }
    },
    {
        name: "system.schema.getfuncroot",
        type: SchemaType.Func,
        display: _LS("system.schema.getfuncroot"),
        func: {
            return: "system.schema.valuetype",
            args: [
                {
                    name: "return",
                    type: "system.schema.valuetype",
                },
                {
                    name: "type",
                    type: "system.schema.expressiontype",
                }
            ],
            exps: [],
            func: async(ret: string, type: ExpressionType) =>
            {
                switch(type)
                {
                    case ExpressionType.Call:
                    case ExpressionType.Reduce:
                        return ret

                    case ExpressionType.Map:
                        const schema = ret ? await getSchema(ret) : null
                        return schema?.array?.element

                    case ExpressionType.Filter:
                    case ExpressionType.First:
                    case ExpressionType.Last:
                        return NS_SYSTEM_BOOL
                }
            }
        }
    },
    {
        name: "system.schema.funcexp",
        type: SchemaType.Struct,
        display: _LS("system.schema.funcexp"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("system.schema.funcexp.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "return",
                    require: true,
                    type: "system.schema.valuetype",
                    display: _LS("system.schema.funcexp.return"),
                },
                {
                    name: "type",
                    require: true,
                    type: "system.schema.expressiontype",
                    default: ExpressionType.Call,
                    display: _LS("system.schema.funcexp.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "system.schema.functype",
                    display: _LS("system.schema.funcexp.func"),
                },
                {
                    name: "args",
                    require: true,
                    type: "system.schema.funccallargs",
                    display: _LS("system.schema.funcexp.args"),
                }
            ],
            relations: [
                {
                    field: "type",
                    type: RelationType.WhiteList,
                    func: "system.schema.getcalltypewhitelist",
                    args: [
                        {
                            name: "return"
                        }
                    ]
                },
                {
                    field: "func",
                    type: RelationType.Root,
                    func: "system.schema.getfuncroot",
                    args: [
                        {
                            name: "return"
                        },
                        {
                            name: "type"
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "system.schema.funcexps",
        type: SchemaType.Array,
        display: _LS("system.schema.funcexps"),
        array: {
            element: "system.schema.funcexp",
            primary: ["name"],
        },
    },
    {
        name: "system.schema.funcschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.funcschema"),
        struct: {
            fields: [
                {
                    name: "return",
                    require: true,
                    immutable: true,
                    type: "system.schema.valuetype",
                    display: _LS("system.schema.funcschema.return")
                },
                {
                    name: "args",
                    require: true,
                    type: "system.schema.funcargs",
                    display: _LS("system.schema.funcschema.args")
                },
                {
                    name: "exps",
                    require: true,
                    type: "system.schema.funcexps",
                    display: _LS("system.schema.funcschema.exps")
                },
                {
                    name: "generic",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("system.schema.funcschema.generic"),
                    invisible: true,
                },
                {
                    name: "server",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.funcschema.server"),
                },
                {
                    name: "nocache",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("system.schema.funcschema.nocache"),
                }
            ],
        }
    },
    //#endregion

    //#region namespace defintion
    {
        name: "system.schema.nodeschema",
        type: SchemaType.Struct,
        display: _LS("system.schema.nodeschema"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    immutable: true,
                    type: "system.schema.namespaceinput",
                    display: _LS("system.schema.nodeschema.name"),
                },
                {
                    name: "type",
                    require: true,
                    immutable: true,
                    type: "system.schema.schematype",
                    display: _LS("system.schema.nodeschema.type"),
                    default: SchemaType.Namespace,
                    blackList: [SchemaType.Json],
                } as IStructEnumFieldConfig,
                {
                    name: "display",
                    require: true,
                    type: "system.localestring",
                    display: _LS("system.schema.nodeschema.display"),
                    upLimit: 128,
                } as IStructScalarFieldConfig,
                {
                    name: "scalar",
                    type: "system.schema.scalarschema",
                    display: _LS("system.schema.nodeschema.scalar"),
                },
                {
                    name: "enum",
                    type: "system.schema.enumschema",
                    display: _LS("system.schema.nodeschema.enum"),
                },
                {
                    name: "struct",
                    type: "system.schema.structschema",
                    display: _LS("system.schema.nodeschema.struct"),
                },
                {
                    name: "array",
                    type: "system.schema.arrayschema",
                    display: _LS("system.schema.nodeschema.array"),
                },
                {
                    name: "func",
                    type: "system.schema.funcschema",
                    display: _LS("system.schema.nodeschema.func"),
                },
            ],
            relations: [
                {
                    field: "scalar",
                    type: RelationType.Invisible,
                    func: "system.logic.notequal",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            value: SchemaType.Scalar
                        }
                    ]
                },
                {
                    field: "enum",
                    type: RelationType.Invisible,
                    func: "system.logic.notequal",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            value: SchemaType.Enum
                        }
                    ]
                },
                {
                    field: "struct",
                    type: RelationType.Invisible,
                    func: "system.logic.notequal",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            value: SchemaType.Struct
                        }
                    ]
                },
                {
                    field: "array",
                    type: RelationType.Invisible,
                    func: "system.logic.notequal",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            value: SchemaType.Array
                        }
                    ]
                },
                {
                    field: "func",
                    type: RelationType.Invisible,
                    func: "system.logic.notequal",
                    args: [
                        {
                            name: "type"
                        },
                        {
                            value: SchemaType.Func
                        }
                    ]
                }
            ]
        }
    },
    //#endregion
], SchemaLoadState.System)

//#region Schema storage

// reload schemas from storage
export function reloadStorageSchemas()
{
    const namelist = localStorage["schema_custom_namelist"]
    const list = namelist ? JSON.parse(namelist) : null
    if (!list || !Array.isArray(list)) return

    const schemas: INodeSchema[] = []
    for(let i = 0; i < list.length; i++)
    {
        const data = localStorage[`schema_data_${list[i]}`]
        const schema = data ? JSON.parse(data) : null
        if (!schema || typeof(schema) !== "object") continue
        schemas.push(schema)
    }
    registerSchema(schemas, SchemaLoadState.Custom)
}

// save schema to storage
export function saveStorageSchema(schema: INodeSchema)
{
    // only save custom schema in the cache
    if (schema.loadState && (schema.loadState & SchemaLoadState.Custom) == 0) return

    // update name list
    const namelist = localStorage["schema_custom_namelist"]
    let list: string[] = namelist ? JSON.parse(namelist) : []
    const name = schema.name.toLowerCase()
    if (!Array.isArray(list)) list = []
    if (!list.includes(name))
    {
        list.push(name)
        list.sort()
        localStorage["schema_custom_namelist"] = JSON.stringify(list)
    }

    // save schema
    localStorage[`schema_data_${name}`] = JSON.stringify({
        name: schema.name,
        type: schema.type,
        desc: schema.display,
        scalar: schema.scalar,
        enum: schema.enum,
        struct: schema.struct,
        array: schema.array,
        func: schema.func,
    })
}

// delete schema from storage
export function removeStorageSchema(name: string | INodeSchema)
{
    name = (typeof(name) === "object" ? name.name : name).toLowerCase()
    delete localStorage[`schema_data_${name}`]
    const namelist = localStorage["schema_custom_namelist"]
    let list: string[] = namelist ? JSON.parse(namelist) : []
    if (Array.isArray(list) && list.includes(name))
    {
        const index = list.findIndex(n => n === name)
        if (index >= 0)
        {
            list.splice(index, 1)
            localStorage["schema_custom_namelist"] = JSON.stringify(list)
        }
    }
}

// clear all stroage schemas
export function clearAllStorageSchemas()
{
    const namelist = localStorage["schema_custom_namelist"]
    const list = namelist ? JSON.parse(namelist) : null
    if (!list || !Array.isArray(list)) return

    for(let i = 0; i < list.length; i++)
    {
        delete localStorage[`schema_data_${list[i]}`]
    }
    delete localStorage["schema_custom_namelist"]
    location.reload()
}

// save all custom types to the storage
export function saveAllCustomSchemaToStroage(root: string = "")
{
    const schema = getCachedSchema(root)
    schema?.schemas?.forEach((s: INodeSchema) => {
        if ((s.loadState || 0) & SchemaLoadState.Custom)
        {
            saveStorageSchema(s)
            if (s.type === SchemaType.Namespace)
            {
                saveAllCustomSchemaToStroage(s.name)
            }
        }
    })
}

// export schema
export function schemaToJson(f: INodeSchema): INodeSchema
{
    const r: INodeSchema = { name: f.name, type: f.type, display: deepClone(f.display) }

    switch(f.type)
    {
        case SchemaType.Namespace:
            r.schemas = f.schemas?.filter((f: INodeSchema) => f.type === SchemaType.Namespace || !((f.loadState || 0) & SchemaLoadState.System)).map(schemaToJson).filter((f: INodeSchema) => f.type !== SchemaType.Namespace || f.schemas?.length)
            break

        case SchemaType.Scalar:
            r.scalar = deepClone(f.scalar, true)
            break

        case SchemaType.Enum:
            r.enum = deepClone(f.enum, true)
            break

        case SchemaType.Struct:
            r.struct = deepClone(f.struct, true)
            break

        case SchemaType.Array:
            r.array = deepClone(f.array, true)
            break

        case SchemaType.Func:
            r.func = { ...deepClone(f.func!, true), func: undefined }
            if (!r.func!.exps) r.func!.exps = []
            if (!r.func!.args) r.func!.args = []
            break
    }
    return r
}

//#endregion

//#region  View

import namespaceView from "./view/namespaceView.vue"
import namespaceInputView from "./view/namespaceInputView.vue"
import enumvalueinfosView from "./view/enumvalueinfosView.vue"
import structfieldtypesView from "./view/structfieldtypesView.vue"
import structfldrelationinfosView from "./view/structfldrelationinfosView.vue"
import reltarfieldView from "./view/reltarfieldView.vue"
import structfldfuncargsView from "./view/structfldfuncargsView.vue"
import funcdefineView from "./view/funcdefineView.vue"
import { regSchemaTypeView } from "schema-node-vueview"

regSchemaTypeView("system.schema.anytype", namespaceView)
regSchemaTypeView("system.schema.namespace", namespaceView)
regSchemaTypeView("system.schema.scalartype", namespaceView)
regSchemaTypeView("system.schema.enumtype", namespaceView)
regSchemaTypeView("system.schema.structtype", namespaceView)
regSchemaTypeView("system.schema.arraytype", namespaceView)
regSchemaTypeView("system.schema.functype", namespaceView)
regSchemaTypeView("system.schema.pushfunctype", namespaceView)
regSchemaTypeView("system.schema.validfunc", namespaceView)
regSchemaTypeView("system.schema.whitelistfunc", namespaceView)
regSchemaTypeView("system.schema.arrayeletype", namespaceView)
regSchemaTypeView("system.schema.valuetype", namespaceView)
regSchemaTypeView("system.schema.namespaceinput", namespaceInputView)

regSchemaTypeView("system.schema.enumvalueinfos", enumvalueinfosView)
regSchemaTypeView("system.schema.enumintvalueinfos", enumvalueinfosView)
regSchemaTypeView("system.schema.enumflagsvalueinfos", enumvalueinfosView)

regSchemaTypeView("system.schema.structfieldconfigs", structfieldtypesView)
regSchemaTypeView("system.schema.structfieldrelations", structfldrelationinfosView)
regSchemaTypeView("system.schema.reltarfield", reltarfieldView)
regSchemaTypeView("system.schema.structfldfuncargs", structfldfuncargsView)

regSchemaTypeView("system.schema.funcschema", funcdefineView)

//#endregion