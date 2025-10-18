import { _L, _LS, ARRAY_ELEMENT, ARRAY_ITSELF, DataCombineType, deepClone, EnumValueType, ExpressionType, getArraySchema, getCachedSchema, getSchema, isNull, isSchemaCanBeUseAs, isStructFieldIndexable, NS_SYSTEM_ARRAY, NS_SYSTEM_BOOL, NS_SYSTEM_GUID, NS_SYSTEM_INT, NS_SYSTEM_INTS, NS_SYSTEM_NUMBER, NS_SYSTEM_STRING, NS_SYSTEM_STRINGS, registerSchema, RelationType, SchemaLoadState, SchemaType, type ILocaleString, type INodeSchema, type IStructEnumFieldConfig, type IStructFieldConfig, type IStructScalarFieldConfig } from "schema-node"

// Schema for definition
registerSchema([
    {
        name: "schema",
        type: SchemaType.Namespace,
        display: _LS("schema"),
    },

    //#region scalar type
    {
        name: "schema.anytype",
        type: SchemaType.Scalar,
        display: _LS("schema.anytype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.namespace",
        type: SchemaType.Scalar,
        display: _LS("schema.namespace"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.scalartype",
        type: SchemaType.Scalar,
        display: _LS("schema.scalartype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.enumtype",
        type: SchemaType.Scalar,
        display: _LS("schema.enumtype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.structtype",
        type: SchemaType.Scalar,
        display: _LS("schema.structtype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.arraytype",
        type: SchemaType.Scalar,
        display: _LS("schema.arraytype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.functype",
        type: SchemaType.Scalar,
        display: _LS("schema.functype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.pushfunctype",
        type: SchemaType.Scalar,
        display: _LS("schema.pushfunctype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.scalarvalidfunc",
        type: SchemaType.Scalar,
        display: _LS("schema.scalarvalidfunc"),
        scalar: {
            base: NS_SYSTEM_STRING,
        },
    },
    {
        name: "schema.scalarwhitelistfunc",
        type: SchemaType.Scalar,
        display: _LS("schema.scalarwhitelistfunc"),
        scalar: {
            base: NS_SYSTEM_STRING,
        },
    },
    {
        name: "schema.scalarenumtype",
        type: SchemaType.Scalar,
        display: _LS("schema.scalarenumtype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.arrayeletype",
        type: SchemaType.Scalar,
        display: _LS("schema.arrayeletype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.valuetype",
        type: SchemaType.Scalar,
        display: _LS("schema.valuetype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.varname",
        type: SchemaType.Scalar,
        display: _LS("schema.varname"),
        scalar: {
            base: NS_SYSTEM_STRING,
            regex: "^[a-zA-Z]\\w*$",
        }
    },
    {
        name: "schema.namespaceinput",
        type: SchemaType.Scalar,
        display: _LS("schema.namespaceinput"),
        scalar: {
            base: NS_SYSTEM_STRING,
            upLimit: 128,
            regex: "^[a-z]\\w*(\.[a-z]\\w*)*$",
        }
    },
    {
        name: "schema.reltarfield",
        type: SchemaType.Scalar,
        display: _LS("schema.reltarfield"),
        scalar: {
            base: NS_SYSTEM_STRING,
            upLimit: 128,
        }
    },
    {
        name: "schema.anyvalue",
        type: SchemaType.Scalar,
        display: _LS("schema.anyvalue"),
        scalar: {
        }
    },
    {
        name: "schema.color",
        type: SchemaType.Scalar,
        display: _LS("schema.color"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    //#endregion

    //#region enum type
    {
        name: "schema.schematype",
        type: SchemaType.Enum,
        display: _LS("schema.schematype"),
        enum: {
            type: EnumValueType.String,
            values: [
                {
                    value: SchemaType.Namespace,
                    name: _LS("schema.schematype.namespace"),
                },
                {
                    value: SchemaType.Enum,
                    name: _LS("schema.schematype.enum"),
                },
                {
                    value: SchemaType.Scalar,
                    name: _LS("schema.schematype.scalar"),
                },
                {
                    value: SchemaType.Struct,
                    name: _LS("schema.schematype.struct"),
                },
                {
                    value: SchemaType.Array,
                    name: _LS("schema.schematype.array"),
                },
                {
                    value: SchemaType.Function,
                    name: _LS("schema.schematype.func"),
                },
                {
                    value: SchemaType.Json,
                    name: _LS("schema.schematype.json")
                }
            ]
        }
    },
    {
        name: "schema.relationtype",
        type: SchemaType.Enum,
        display: _LS("schema.relationtype"),
        enum: {
            type: EnumValueType.String,
            values: [
                {
                    value: RelationType.Default,
                    name: _LS("schema.relationtype.default"),
                },
                {
                    value: RelationType.Root,
                    name: _LS("schema.relationtype.root"),
                },
                {
                    value: RelationType.BlackList,
                    name: _LS("schema.relationtype.blacklist"),
                },
                {
                    value: RelationType.WhiteList,
                    name: _LS("schema.relationtype.whitelist"),
                },
                {
                    value: RelationType.LowLimit,
                    name: _LS("schema.relationtype.lowlimit"),
                },
                {
                    value: RelationType.UpLimit,
                    name: _LS("schema.relationtype.uplimit"),
                },
                {
                    value: RelationType.Invisible,
                    name: _LS("schema.relationtype.invisible"),
                },
                {
                    value: RelationType.Visible,
                    name: _LS("schema.relationtype.visible"),
                },
                {
                    value: RelationType.Disable,
                    name: _LS("schema.relationtype.disable"),
                },
                {
                    value: RelationType.Assign,
                    name: _LS("schema.relationtype.assign"),
                },
                {
                    value: RelationType.InitOnly,
                    name: _LS("schema.relationtype.initonly"),
                },
                {
                    value: RelationType.Type,
                    name: _LS("schema.relationtype.type"),
                },
                {
                    value: RelationType.AnyLevel,
                    name: _LS("schema.relationtype.anylevel")
                },
                {
                    value: RelationType.Cascade,
                    name: _LS("schema.relationtype.cascade")
                },
                {
                    value: RelationType.SingleFlag,
                    name: _LS("schema.relationtype.singleflag")
                },
                {
                    value: RelationType.Validation,
                    name: _LS("schema.relationtype.validation")
                }
            ]
        }
    },
    {
        name: "schema.exptype",
        type: SchemaType.Enum,
        display: _LS("schema.exptype"),
        enum: {
            type: EnumValueType.String,
            values: [
                {
                    value: ExpressionType.Call,
                    name: _LS("schema.exptype.call"),
                },
                {
                    value: ExpressionType.Map,
                    name: _LS("schema.exptype.map"),
                },
                {
                    value: ExpressionType.Reduce,
                    name: _LS("schema.exptype.reduce"),
                },
                {
                    value: ExpressionType.First,
                    name: _LS("schema.exptype.first"),
                },
                {
                    value: ExpressionType.Last,
                    name: _LS("schema.exptype.last"),
                },
                {
                    value: ExpressionType.Filter,
                    name: _LS("schema.exptype.filter"),
                },
            ]
        }
    },
    {
        name: "schema.exptypes",
        type: SchemaType.Array,
        display: _LS("schema.exptypes"),
        array: {
            element: "schema.exptype"
        }
    },
    {
        name: "schema.enumvaluetype",
        type: SchemaType.Enum,
        display: _LS("schema.enumvaluetype"),
        enum: {
            type: EnumValueType.String,
            values: [
                {
                    value: EnumValueType.String,
                    name: _LS("schema.enumvaluetype.string")
                },
                {
                    value: EnumValueType.Int,
                    name: _LS("schema.enumvaluetype.int")
                },
                {
                    value: EnumValueType.Flags,
                    name: _LS("schema.enumvaluetype.flags")
                },
            ]
        }
    },
    {
        name: "schema.datacombinetype",
        type: SchemaType.Enum,
        display: _LS("schema.datacombinetype"),
        enum: {
            type: EnumValueType.String,
            values: [
                {
                    value: DataCombineType.Assign,
                    name: _LS("schema.datacombinetype.assign")
                },
                {
                    value: DataCombineType.Init,
                    name: _LS("schema.datacombinetype.init")
                },
                {
                    value: DataCombineType.Sum,
                    name: _LS("schema.datacombinetype.sum")
                },
                {
                    value: DataCombineType.Count,
                    name: _LS("schema.datacombinetype.count")
                }
            ]
        }
    },
    //#endregion

    //#region scalar definition
    {
        name: "schema.scalardefine",
        type: SchemaType.Struct,
        display: _LS("schema.scalardefine"),
        struct: {
            fields: [
                {
                    name: "base",
                    require: true,
                    type: "schema.scalartype",
                    display: _LS("schema.scalardefine.base"),
                },
                {
                    name: "unit",
                    type: "system.localestring",
                    display: _LS("schema.scalardefine.unit"),
                    upLimit: 8,
                } as IStructScalarFieldConfig,
                {
                    name: "lowLimit",
                    type: NS_SYSTEM_NUMBER,
                    display: _LS("schema.scalardefine.lowlimit"),
                },
                {
                    name: "upLimit",
                    type: NS_SYSTEM_NUMBER,
                    display: _LS("schema.scalardefine.uplimit"),
                },
                {
                    name: "error",
                    type: "system.localestring",
                    display: _LS("schema.scalardefine.error"),
                    upLimit: 128,
                },
                {
                    name: "regex",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.scalardefine.regex"),
                },
                {
                    name: "whiteList",
                    type: "schema.scalarwhitelistfunc",
                    display: _LS("schema.scalardefine.whitelist")
                },
                {
                    name: "asSuggest",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.assuggest")
                },
                {
                    name: "preValid",
                    type: "schema.scalarvalidfunc",
                    display: _LS("schema.scalardefine.prevalid"),
                } as IStructScalarFieldConfig,
                {
                    name: "postValid",
                    type: "schema.scalarvalidfunc",
                    display: _LS("schema.scalardefine.postvalid"),
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
        name: "schema.enumvalueinfo",
        type: SchemaType.Struct,
        display: _LS("schema.enumvalueinfo"),
        struct: {
            fields: [
                {
                    name: "value",
                    require: true,
                    immutable: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.enumvalueinfo.value"),
                } as IStructScalarFieldConfig,
                {
                    name: "name",
                    require: true,
                    type: "system.localestring",
                    display: _LS("schema.enumvalueinfo.name"),
                    upLimit: 64
                },
                {
                    name: "disable",
                    default: false,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.enumvalueinfo.disable"),
                }
            ]
        },
    },
    {
        name: "schema.enumvalueinfos",
        type: SchemaType.Array,
        display: _LS("schema.enumvalueinfos"),
        array: {
            element: "schema.enumvalueinfo",
            primary: ["value"],
        },
    },
    {
        name: "schema.enumintvalueinfo",
        type: SchemaType.Struct,
        display: _LS("schema.enumvalueinfo"),
        struct: {
            fields: [
                {
                    name: "value",
                    require: true,
                    immutable: true,
                    type: NS_SYSTEM_INT,
                    display: _LS("schema.enumvalueinfo.value"),
                } as IStructScalarFieldConfig,
                {
                    name: "name",
                    require: true,
                    type: "system.localestring",
                    display: _LS("schema.enumvalueinfo.name"),
                    upLimit: 64
                },
                {
                    name: "disable",
                    default: false,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.enumvalueinfo.disable"),
                }
            ]
        },
    },
    {
        name: "schema.enumintvalueinfos",
        type: SchemaType.Array,
        display: _LS("schema.enumvalueinfos"),
        array: {
            element: "schema.enumintvalueinfo",
            primary: ["value"],
        },
    },
    {
        name: "schema.enumflagvalueinfo",
        type: SchemaType.Struct,
        display: _LS("schema.enumvalueinfo"),
        struct: {
            fields: [
                {
                    name: "value",
                    require: true,
                    immutable: true,
                    readonly: true,
                    type: NS_SYSTEM_INT,
                    display: _LS("schema.enumvalueinfo.value"),
                } as IStructScalarFieldConfig,
                {
                    name: "name",
                    require: true,
                    type: "system.localestring",
                    display: _LS("schema.enumvalueinfo.name"),
                    upLimit: 64
                },
                {
                    name: "disable",
                    default: false,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.enumvalueinfo.disable"),
                }
            ]
        },
    },
    {
        name: "schema.enumflagsvalueinfos",
        type: SchemaType.Array,
        display: _LS("schema.enumvalueinfos"),
        array: {
            element: "schema.enumflagvalueinfo",
            primary: ["value"],
            relations: [
                {
                    field: "value",
                    type: RelationType.Assign,
                    func: "schema.calcnextflag",
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
        name: "schema.calcnextflag",
        type: SchemaType.Function,
        display: _LS("schema.calcnextflag"),
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
        name: "schema.getenuminfostype",
        type: SchemaType.Function,
        display: _LS("schema.getenuminfostype"),
        func: {
            return: "schema.arraytype",
            args: [
                {
                    name: "type",
                    type: "schema.enumvaluetype"
                }
            ],
            exps: [],
            func: (type: EnumValueType) => {
                switch (type)
                {
                    case EnumValueType.String:
                        return "schema.enumvalueinfos"
                    case EnumValueType.Int:
                        return "schema.enumintvalueinfos"
                    case EnumValueType.Flags:
                        return "schema.enumflagsvalueinfos"
                }
            }
        }
    },
    {
        name: "schema.enumdefine",
        type: SchemaType.Struct,
        display: _LS("schema.enumdefine"),
        struct: {
            fields: [
                {
                    name: "type",
                    require: true,
                    type: "schema.enumvaluetype",
                    display: _LS("schema.enumdefine.type"),
                    default: EnumValueType.Int,
                },
                {
                    name: "cascade",
                    type: "system.localestrings",
                    display: _LS("schema.enumdefine.cascade"),
                },
                {
                    name: "values",
                    type: "schema.enumvalueinfos",
                    display: _LS("schema.enumdefine.values"),
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
                    func: "schema.getenuminfostype",
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
        name: "schema.structindex",
        type: SchemaType.Struct,
        display: _LS("schema.structindex"),
        struct: {
            fields: [
                {
                    name: "fields",
                    require: true,
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.structindex.fields"),
                },
                {
                    name: "unique",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structindex.unique"),
                    default: false
                },
            ]
        }
    },
    {
        name: "schema.structindexs",
        type: SchemaType.Array,
        display: _LS("schema.structindexs"),
        array: {
            element: "schema.structindex",
        },
    },
    {
        name: "schema.isvaluenotnull",
        type: SchemaType.Function,
        display: _LS("schema.isvaluenotnull"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "value",
                    type: "schema.anyvalue"
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
        name: "schema.getexpvaluetype",
        type: SchemaType.Function,
        display: _LS("schema.getexpvaluetype"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.hideexpvalue",
        type: SchemaType.Function,
        display: _LS("schema.hideexpvalue"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.structfldfuncarg",
        type: SchemaType.Struct,
        display: _LS("schema.structfldfuncarg"),
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
                    displayOnly: true,
                    display: _LS("schema.structfldfuncarg.type"),
                },
                {
                    name: "name",
                    type: "schema.reltarfield",
                    display: _LS("schema.structfldfuncarg.name"),
                },
                {
                    name: "value",
                    type: "schema.anyvalue",
                    display: _LS("schema.structfldfuncarg.value"),
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
        name: "schema.structfldfuncargs",
        type: SchemaType.Array,
        display: _LS("schema.structfldfuncargs"),
        array: {
            element: "schema.structfldfuncarg",
        },
    },
    {
        name: "schema.notscalartype",
        type: SchemaType.Function,
        display: _LS("schema.notscalartype"),
        func: {
            return : NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.notenumtype",
        type: SchemaType.Function,
        display: _LS("schema.notenumtype"),
        func: {
            return : NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.notscalarenumtype",
        type: SchemaType.Function,
        display: _LS("schema.notscalarenumtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype",
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
        name: "schema.notcascadeenumtype",
        type: SchemaType.Function,
        display: _LS("schema.notcascadeenumtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args:[
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.getroottype",
        type: SchemaType.Function,
        display: _LS("schema.getroottype"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.notflagsenumtype",
        type: SchemaType.Function,
        display: _LS("schema.notflagsenumtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.getenumcascadewhitelist",
        type: SchemaType.Function,
        display: _LS("schema.getenumcascadewhitelist"),
        func: {
            return: NS_SYSTEM_ARRAY,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.noenumroot",
        type: SchemaType.Function,
        display: _LS("schema.noenumroot"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.getenumrootcascade",
        type: SchemaType.Function,
        display: _LS("schema.getenumrootcascade"),
        func: {
            return: NS_SYSTEM_INT,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.getwhiteblacklisttype",
        type: SchemaType.Function,
        display: _LS("schema.getwhiteblacklisttype"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.getscalarorenumtype",
        type: SchemaType.Function,
        display: _LS("schema.getscalarorenumtype"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.structfieldtype",
        type: SchemaType.Struct,
        display: _LS("schema.structfieldtype"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "schema.varname",
                    display: _LS("schema.structfieldtype.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "schema.valuetype",
                    display: _LS("schema.structfieldtype.type"),
                },
                {
                    name: "display",
                    type: "system.localestring",
                    display: _LS("schema.structfieldtype.display"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: "system.localestring",
                    display: _LS("schema.structfieldtype.desc"),
                    upLimit: 255,
                } as IStructScalarFieldConfig,
                {
                    name: "error",
                    type: "system.localestring",
                    display: _LS("schema.structfieldtype.error"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "require",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.require"),
                },
                {
                    name: "immutable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.immutable"),
                },
                {
                    name: "readonly",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.readonly"),
                },
                {
                    name: "invisible",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.invisible"),
                },
                {
                    name: "displayOnly",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.displayonly"),
                },
                {
                    name: "unit",
                    type: "system.localestring",
                    display: _LS("schema.structfieldtype.unit"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "default",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.default"),
                    asSuggest: true,
                },

                // scalar config
                {
                    name: "whiteList",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.structfieldtype.whitelist"),
                    anyLevel: true
                } as IStructEnumFieldConfig,
                {
                    name: "blackList",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.structfieldtype.blacklist"),
                    anyLevel: true,
                } as IStructEnumFieldConfig,
                {
                    name: "lowLimit",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.lowlimit"),
                },
                {
                    name: "upLimit",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.uplimit"),
                },
                {
                    name: "asSuggest",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.assuggest"),
                },
                {
                    name: "useOriginForUpLimit",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.useoriginforuplimit"),
                },

                // enum config
                {
                    name: "cascade",
                    type: NS_SYSTEM_INT,
                    display: _LS("schema.structfieldtype.cascade"),
                },
                {
                    name: "root",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.root"),
                    anyLevel: true,
                } as IStructEnumFieldConfig,
                {
                    name: "anyLevel",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.anylevel"),
                },
                {
                    name: "singleFlag",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.structfieldtype.singleflag"),
                },
            ],
            relations: [
                // default
                {
                    field: "default",
                    type: RelationType.Invisible,
                    func: "schema.notscalarenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "default",
                    type: RelationType.Type,
                    func: "schema.getscalarorenumtype",
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
                    func: "schema.notscalarenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "whiteList",
                    type: RelationType.Type,
                    func: "schema.getwhiteblacklisttype",
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
                    func: "schema.notscalarenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "blackList",
                    type: RelationType.Type,
                    func: "schema.getwhiteblacklisttype",
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
                    func: "schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "upLimit",
                    type: RelationType.Invisible,
                    func: "schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "asSuggest",
                    type: RelationType.Invisible,
                    func: "schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "useOriginForUpLimit",
                    type: RelationType.Invisible,
                    func: "schema.notscalartype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "cascade",
                    type: RelationType.Invisible,
                    func: "schema.notcascadeenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "cascade",
                    type: RelationType.WhiteList,
                    func: "schema.getenumcascadewhitelist",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "root",
                    type: RelationType.Invisible,
                    func: "schema.noenumroot",
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
                    func: "schema.getroottype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "root",
                    type: RelationType.Cascade,
                    func: "schema.getenumrootcascade",
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
                    func: "schema.notcascadeenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "singleFlag",
                    type: RelationType.Invisible,
                    func: "schema.notflagsenumtype",
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
        name: "schema.structfieldtypes",
        type: SchemaType.Array,
        display: _LS("schema.structfieldtypes"),
        array: {
            element: "schema.structfieldtype",
            primary: ["name"],
        },
    },
    {
        name: "schema.getstructindexfields",
        type: SchemaType.Function,
        display: _LS("schema.getstructindexfields"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.getstructnumbervaluefields",
        type: SchemaType.Function,
        display: _LS("schema.getstructnumbervaluefields"),
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.getrelationfuncreturn",
        type: SchemaType.Function,
        display: _LS("schema.getrelationfuncreturn"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "fieldType",
                    type: "schema.valuetype"
                },
                {
                    name: "relationType",
                    type: "schema.relationtype"
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
                        return "schema.valuetype"

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
        name: "schema.getrelationwhitelist",
        type: SchemaType.Function,
        display: _LS("schema.getrelationwhitelist"),
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
        name: "schema.getstructfieldtype",
        type: SchemaType.Function,
        display: _LS("schema.getstructfieldtype"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING
                },
                {
                    name: "fields",
                    type: "schema.structfieldtypes"
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
        name: "schema.getstructfieldtypebytype",
        type: SchemaType.Function,
        display: _LS("schema.getstructfieldtypebytype"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.structfldrelationinfo",
        type: SchemaType.Struct,
        display: _LS("schema.structfldrelationinfo"),
        struct: {
            fields: [
                {
                    name: "field",
                    require: true,
                    type: "schema.reltarfield",
                    display: _LS("schema.structfldrelationinfo.field"),
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
                    display: _LS("schema.structfldrelationinfo.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "schema.functype",
                    display: _LS("schema.structfldrelationinfo.func"),
                },
                {
                    name: "args",
                    type: "schema.structfldfuncargs",
                    display: _LS("schema.structfldrelationinfo.args"),
                },
            ],
            relations: [
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
        name: "schema.structfldrelationinfos",
        type: SchemaType.Array,
        display: _LS("schema.structfldrelationinfos"),
        array: {
            element: "schema.structfldrelationinfo",
            primary: ["field", "type"],
        },
    },
    {
        name: "schema.structdefine",
        type: SchemaType.Struct,
        display: _LS("schema.structdefine"),
        struct: {
            fields: [
                {
                    name: "base",
                    type: "schema.structtype",
                    display: _LS("schema.structdefine.base"),
                },
                {
                    name: "fields",
                    require: true,
                    type: "schema.structfieldtypes",
                    display: _LS("schema.structdefine.fields"),
                },
                {
                    name: "relations",
                    type: "schema.structfldrelationinfos",
                    display: _LS("schema.structdefine.relations"),
                },
            ],
            relations: [
                {
                    field: "relations.fieldType",
                    type: RelationType.Default,
                    func: "schema.getstructfieldtype",
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
        name: "schema.notstructtype",
        type: SchemaType.Function,
        display: _LS("schema.notstructtype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype",
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
        name: "schema.notstructarraytype",
        type: SchemaType.Function,
        display: _LS("schema.notstructarraytype"),
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype",
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
        name: "schema.datacombine",
        type: SchemaType.Struct,
        display: _LS("schema.datacombine"),
        struct: {
            fields: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.datacombine.field")
                },
                {
                    name: "type",
                    type: "schema.datacombinetype",
                    display: _LS("schema.datacombine.type")
                }
            ]
        }
    },
    {
        name: "schema.datacombines",
        type: SchemaType.Array,
        display: _LS("schema.datacombines"),
        array: {
            element: "schema.datacombine",
            primary: ["field"]
        }
    },
    {
        name: "schema.dataindex",
        type: SchemaType.Struct,
        display: _LS("schema.dataindex"),
        struct: {
            fields: [
                {
                    name: "name",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.dataindex.name"),
                    upLimit: 16,
                } as IStructScalarFieldConfig,
                {
                    name: "fields",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.dataindex.fields"),
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
        name: "schema.dataindexes",
        type: SchemaType.Array,
        display: _LS("schema.dataindexes"),
        array: {
            element: "schema.dataindex",
            primary: ["name"]
        }
    },
    {
        name: "schema.arraydefine",
        type: SchemaType.Struct,
        display: _LS("schema.arraydefine"),
        struct: {
            fields: [
                {
                    name: "element",
                    type: "schema.arrayeletype",
                    display: _LS("schema.arraydefine.element"),
                },
                {
                    name: "single",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.arraydefine.single"),
                },
                {
                    name: "primary",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.arraydefine.primary"),
                },
                {
                    name: "indexes",
                    type: "schema.dataindexes",
                    display: _LS("schema.dataindexes")
                },
                {
                    name: "combines",
                    type: "schema.datacombines",
                    display: _LS("schema.arraydefine.combine"),
                },
                {
                    name: "relations",
                    type: "schema.structfldrelationinfos",
                    display: _LS("schema.structdefine.relations"),
                },
            ],
            relations: [
                {
                    field: "primary",
                    type: RelationType.Invisible,
                    func: "schema.notstructtype",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "primary.$ele",
                    type: RelationType.WhiteList,
                    func: "schema.getstructindexfields",
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
                    func: "schema.notstructtype",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "indexes.fields.$ele",
                    type: RelationType.WhiteList,
                    func: "schema.getstructindexfields",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "combines",
                    type: RelationType.Invisible,
                    func: "schema.notstructtype",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "combines.field",
                    type: RelationType.WhiteList,
                    func: "schema.getstructnumbervaluefields",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "relations.fieldType",
                    type: RelationType.Default,
                    func: "schema.getstructfieldtypebytype",
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
        name: "schema.funcarg",
        type: SchemaType.Struct,
        display: _LS("schema.funcarg"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.funcarg.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "schema.valuetype",
                    display: _LS("schema.funcarg.type"),
                },
                {
                    name: "nullable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.funcarg.nullable"),
                }
            ]
        }
    },
    {
        name: "schema.funcargs",
        type: SchemaType.Array,
        display: _LS("schema.funcargs"),
        array: {
            element: "schema.funcarg",
        },
    },
    {
        name: "schema.funccallarg",
        type: SchemaType.Struct,
        display: _LS("schema.funccallarg"),
        struct: {
            fields: [
                {
                    name: "display",
                    type: NS_SYSTEM_STRING,
                    displayOnly: true,
                    display: _LS("schema.funccallarg.display"),
                },
                {
                    name: "type",
                    type: "schema.valuetype",
                    displayOnly: true,
                    invisible: true,
                    display: _LS("schema.structfldfuncarg.type"),
                },
                {
                    name: "name",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.funccallarg.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "value",
                    type: "schema.anyvalue",
                    display: _LS("schema.funccallarg.value"),
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
        name: "schema.funccallargs",
        type: SchemaType.Array,
        display: _LS("schema.funccallargs"),
        array: {
            element: "schema.funccallarg",
        },
    },
    {
        name: "schema.getcalltypewhitelist",
        type: SchemaType.Function,
        display: _LS("schema.getcalltypewhitelist"),
        func: {
            return: "schema.exptypes",
            args: [
                {
                    name: "return",
                    type: "schema.valuetype"
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
        name: "schema.getfuncroot",
        type: SchemaType.Function,
        display: _LS("schema.getfuncroot"),
        func: {
            return: "schema.valuetype",
            args: [
                {
                    name: "return",
                    type: "schema.valuetype",
                },
                {
                    name: "type",
                    type: "schema.exptype",
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
        name: "schema.funcexp",
        type: SchemaType.Struct,
        display: _LS("schema.funcexp"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.funcexp.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "return",
                    require: true,
                    type: "schema.valuetype",
                    display: _LS("schema.funcexp.return"),
                },
                {
                    name: "type",
                    require: true,
                    type: "schema.exptype",
                    default: ExpressionType.Call,
                    display: _LS("schema.funcexp.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "schema.functype",
                    display: _LS("schema.funcexp.func"),
                },
                {
                    name: "args",
                    require: true,
                    type: "schema.funccallargs",
                    display: _LS("schema.funcexp.args"),
                }
            ],
            relations: [
                {
                    field: "type",
                    type: RelationType.WhiteList,
                    func: "schema.getcalltypewhitelist",
                    args: [
                        {
                            name: "return"
                        }
                    ]
                },
                {
                    field: "func",
                    type: RelationType.Root,
                    func: "schema.getfuncroot",
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
        name: "schema.funcexps",
        type: SchemaType.Array,
        display: _LS("schema.funcexps"),
        array: {
            element: "schema.funcexp",
            primary: ["name"],
        },
    },
    {
        name: "schema.funcdefine",
        type: SchemaType.Struct,
        display: _LS("schema.funcdefine"),
        struct: {
            fields: [
                {
                    name: "return",
                    require: true,
                    immutable: true,
                    type: "schema.valuetype",
                    display: _LS("schema.funcdefine.return")
                },
                {
                    name: "args",
                    require: true,
                    type: "schema.funcargs",
                    display: _LS("schema.funcdefine.args")
                },
                {
                    name: "exps",
                    require: true,
                    type: "schema.funcexps",
                    display: _LS("schema.funcdefine.exps")
                },
                {
                    name: "generic",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.funcdefine.generic"),
                    invisible: true,
                },
                {
                    name: "server",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.funcdefine.server"),
                },
                {
                    name: "nocache",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.funcdefine.nocache"),
                }
            ],
        }
    },
    //#endregion

    //#region namespace defintion
    {
        name: "schema.namespacedefine",
        type: SchemaType.Struct,
        display: _LS("schema.namespacedefine"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    immutable: true,
                    type: "schema.namespaceinput",
                    display: _LS("schema.namespacedefine.name"),
                },
                {
                    name: "type",
                    require: true,
                    immutable: true,
                    type: "schema.schematype",
                    display: _LS("schema.namespacedefine.type"),
                    default: SchemaType.Namespace,
                    blackList: [SchemaType.Json],
                } as IStructEnumFieldConfig,
                {
                    name: "display",
                    require: true,
                    type: "system.localestring",
                    display: _LS("schema.namespacedefine.display"),
                    upLimit: 128,
                } as IStructScalarFieldConfig,
                {
                    name: "scalar",
                    type: "schema.scalardefine",
                    display: _LS("schema.namespacedefine.scalar"),
                },
                {
                    name: "enum",
                    type: "schema.enumdefine",
                    display: _LS("schema.namespacedefine.enum"),
                },
                {
                    name: "struct",
                    type: "schema.structdefine",
                    display: _LS("schema.namespacedefine.struct"),
                },
                {
                    name: "array",
                    type: "schema.arraydefine",
                    display: _LS("schema.namespacedefine.array"),
                },
                {
                    name: "func",
                    type: "schema.funcdefine",
                    display: _LS("schema.namespacedefine.func"),
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
                            value: SchemaType.Function
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

        case SchemaType.Function:
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
import colorView from "./view/colorView.vue"
import { regSchemaTypeView } from "schema-node-vueview"

regSchemaTypeView("schema.color", colorView)

regSchemaTypeView("schema.anytype", namespaceView)
regSchemaTypeView("schema.namespace", namespaceView)
regSchemaTypeView("schema.scalartype", namespaceView)
regSchemaTypeView("schema.enumtype", namespaceView)
regSchemaTypeView("schema.structtype", namespaceView)
regSchemaTypeView("schema.arraytype", namespaceView)
regSchemaTypeView("schema.functype", namespaceView)
regSchemaTypeView("schema.pushfunctype", namespaceView)
regSchemaTypeView("schema.scalarvalidfunc", namespaceView)
regSchemaTypeView("schema.scalarwhitelistfunc", namespaceView)
regSchemaTypeView("schema.scalarenumtype", namespaceView)
regSchemaTypeView("schema.arrayeletype", namespaceView)
regSchemaTypeView("schema.valuetype", namespaceView)
regSchemaTypeView("schema.namespaceinput", namespaceInputView)

regSchemaTypeView("schema.enumvalueinfos", enumvalueinfosView)
regSchemaTypeView("schema.enumintvalueinfos", enumvalueinfosView)
regSchemaTypeView("schema.enumflagsvalueinfos", enumvalueinfosView)

regSchemaTypeView("schema.structfieldtypes", structfieldtypesView)
regSchemaTypeView("schema.structfldrelationinfos", structfldrelationinfosView)
regSchemaTypeView("schema.reltarfield", reltarfieldView)
regSchemaTypeView("schema.structfldfuncargs", structfldfuncargsView)

regSchemaTypeView("schema.funcdefine", funcdefineView)

//#endregion