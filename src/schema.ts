import { _L, _LS, ARRAY_ITSELF, DataCombineType, EnumValueType, ExpressionType, getArraySchema, getCachedSchema, getSchema, isSchemaCanBeUseAs, isStructFieldIndexable, NS_SYSTEM_ARRAY, NS_SYSTEM_BOOL, NS_SYSTEM_DOUBLE, NS_SYSTEM_FLOAT, NS_SYSTEM_INT, NS_SYSTEM_INTS, NS_SYSTEM_NUMBER, NS_SYSTEM_STRING, NS_SYSTEM_STRINGS, registerSchema, RelationType, SchemaType, type IStructFieldConfig, type IStructScalarFieldConfig } from "schema-node"

registerSchema([
    //#region scalar type
    {
        name: "schema.namespace",
        type: SchemaType.Scalar,
        desc: _LS("schema.namespace"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.scalartype",
        type: SchemaType.Scalar,
        desc: _LS("schema.scalartype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.enumtype",
        type: SchemaType.Scalar,
        desc: _LS("schema.enumtype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.structtype",
        type: SchemaType.Scalar,
        desc: _LS("schema.structtype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.arraytype",
        type: SchemaType.Scalar,
        desc: _LS("schema.arraytype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.functype",
        type: SchemaType.Scalar,
        desc: _LS("schema.functype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.scalarenumtype",
        type: SchemaType.Scalar,
        desc: _LS("schema.scalarenumtype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.arrayeletype",
        type: SchemaType.Scalar,
        desc: _LS("schema.arrayeletype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.valuetype",
        type: SchemaType.Scalar,
        desc: _LS("schema.valuetype"),
        scalar: {
            base: NS_SYSTEM_STRING,
        }
    },
    {
        name: "schema.varname",
        type: SchemaType.Scalar,
        desc: _LS("schema.varname"),
        scalar: {
            base: NS_SYSTEM_STRING,
            regex: "^[a-zA-Z]\\w*$",
        }
    },
    {
        name: "schema.namespaceinput",
        type: SchemaType.Scalar,
        desc: _LS("schema.namespaceinput"),
        scalar: {
            base: NS_SYSTEM_STRING,
            upLimit: 128,
            regex: "^[a-z]\\w*(\.[a-z]\\w*)*$",
        }
    },
    {
        name: "schema.reltarfield",
        type: SchemaType.Scalar,
        desc: _LS("schema.reltarfield"),
        scalar: {
            base: NS_SYSTEM_STRING,
            upLimit: 128,
        }
    },
    {
        name: "schema.anyvalue",
        type: SchemaType.Scalar,
        desc: _LS("schema.anyvalue"),
        scalar: {
        }
    },
    //#endregion

    //#region enum type
    {
        name: "schema.schematype",
        type: SchemaType.Enum,
        desc: _LS("schema.schematype"),
        enum: {
            type: EnumValueType.String,
            values: [
                {
                    value: SchemaType.Namespace,
                    name: _LS("schema.schematype.ns"),
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
                }
            ]
        }
    },
    {
        name: "schema.relationtype",
        type: SchemaType.Enum,
        desc: _LS("schema.relationtype"),
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
                    value: RelationType.Uplimit,
                    name: _LS("schema.relationtype.uplimit"),
                },
                {
                    value: RelationType.Invisible,
                    name: _LS("schema.relationtype.invisible"),
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
                }
            ]
        }
    },
    {
        name: "schema.exptype",
        type: SchemaType.Enum,
        desc: _LS("schema.exptype"),
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
        name: "schema.enumvaluetype",
        type: SchemaType.Enum,
        desc: _LS("schema.enumvaluetype"),
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
                    value: EnumValueType.Float,
                    name: _LS("schema.enumvaluetype.float")
                },
                {
                    value: EnumValueType.Double,
                    name: _LS("schema.enumvaluetype.double")
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
        desc: _LS("schema.datacombinetype"),
        enum: {
            type: EnumValueType.String,
            values: [
                {
                    value: DataCombineType.Assign,
                    name: _LS("schema.datacombinetype.assign")
                },
                {
                    value: DataCombineType.Sum,
                    name: _LS("schema.datacombinetype.sum")
                },
                {
                    value: DataCombineType.Count,
                    name: _LS("schema.datacombinetype.count")
                },
                {
                    value: DataCombineType.Min,
                    name: _LS("schema.datacombinetype.min")
                },
                {
                    value: DataCombineType.Max,
                    name: _LS("schema.datacombinetype.max")
                },
            ]
        }
    },
    //#endregion

    //#region scalar definition
    {
        name: "schema.scalardefine",
        type: SchemaType.Struct,
        desc: _LS("schema.scalardefine"),
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
                    type: NS_SYSTEM_STRING,
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
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.scalardefine.error"),
                    upLimit: 128,
                },
                {
                    name: "regex",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.scalardefine.regex"),
                },
                {
                    name: "valid",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.scalardefine.valid"),
                },
                {
                    name: "conv",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.scalardefine.conv"),
                },
            ]
        },
    },
    //#endregion

    //#region enum definition
    {
        name: "schema.enumvalueinfo",
        type: SchemaType.Struct,
        desc: _LS("schema.enumvalueinfo"),
        struct: {
            fields: [
                {
                    name: "value",
                    require: true,
                    immutable: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.enumvalueinfo.value"),
                    upLimit: 64
                } as IStructScalarFieldConfig,
                {
                    name: "name",
                    require: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.enumvalueinfo.name"),
                    upLimit: 64
                },
                {
                    name: "disable",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.enumvalueinfo.disable"),
                },
                {
                    name: "hasSubList",
                    invisible: true,
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.enumvalueinfo.hassublist"),
                }
            ]
        },
    },
    {
        name: "schema.enumvalueinfos",
        type: SchemaType.Array,
        desc: _LS("schema.enumvalueinfos"),
        array: {
            element: "schema.enumvalueinfo",
            primary: ["value"],
        },
    },
    {
        name: "schema.calcnextflag",
        type: SchemaType.Function,
        desc: "Gets the next flag value",
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
        name: "schema.enumflagsvalueinfos",
        type: SchemaType.Array,
        desc: _LS("schema.enumvalueinfos"),
        array: {
            element: "schema.enumvalueinfo",
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
        name: "schema.getenumvaluetype",
        type: SchemaType.Function,
        desc: "Gets the enum value type based on the enum schema value type",
        func: {
            return: "schema.scalartype",
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
                        return NS_SYSTEM_STRING
                    case EnumValueType.Int:
                    case EnumValueType.Flags:
                        return NS_SYSTEM_INT
                    case EnumValueType.Float:
                        return NS_SYSTEM_FLOAT
                    case EnumValueType.Double:
                        return NS_SYSTEM_DOUBLE
                }
            }
        }
    },
    {
        name: "schema.getenuminfostype",
        type: SchemaType.Function,
        desc: "Gets the enum infos type based on the enum schema value type",
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
                return type === EnumValueType.Flags ? "schema.enumflagsvalueinfos" : "schema.enumvalueinfos"
            }
        }
    },
    {
        name: "schema.enumdefine",
        type: SchemaType.Struct,
        desc: _LS("schema.enumdefine"),
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
                    immutable: true,
                    type: NS_SYSTEM_STRINGS,
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
                },
                {
                    field: "values.value",
                    type: RelationType.Type,
                    func: "schema.getenumvaluetype",
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
        desc: _LS("schema.structindex"),
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
        desc: _LS("schema.structindexs"),
        array: {
            element: "schema.structindex",
        },
    },
    {
        name: "schema.structfldfuncarg",
        type: SchemaType.Struct,
        desc: _LS("schema.structfldfuncarg"),
        struct: {
            fields: [
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
            ]
        }
    },
    {
        name: "schema.structfldfuncargs",
        type: SchemaType.Array,
        desc: _LS("schema.structfldfuncargs"),
        array: {
            element: "schema.structfldfuncarg",
        },
    },
    {
        name: "schema.notscalartype",
        type: SchemaType.Function,
        desc: "Whether the type not a scalar type",
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
        desc: "Whether the type not an enum type",
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
        desc: "Whether the type not scalar or enum type",
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
                return schema?.type !== SchemaType.Scalar && schema?.type !== SchemaType.Enum
            }
        }
    },
    {
        name: "schema.notcascadeenumtype",
        type: SchemaType.Function,
        desc: "Whether the type not a cascade enum type",
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
                const schema = getCachedSchema(type)
                return schema?.type !== SchemaType.Enum || !schema.enum?.cascade || schema.enum.cascade.length <= 1
            }
        }
    },
    {
        name: "schema.notflagsenumtype",
        type: SchemaType.Function,
        desc: "Whether the type not a flags enum type",
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
        desc: "Gets the enum cascade white list",
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
                const schema = getCachedSchema(type)
                if (schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1) {
                    return schema.enum.cascade.map((item: string, i: number) => ({
                        value: i,
                        label: item.trim()
                    }))
                }
                return null
            }
        }
    },
    {
        name: "schema.structfieldtype",
        type: SchemaType.Struct,
        desc: _LS("schema.structfieldtype"),
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
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.display"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.desc"),
                    upLimit: 255,
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
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.unit"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "default",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.structfieldtype.default"),
                },

                // scalar config
                {
                    name: "whiteList",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.structfieldtype.whitelist"),
                },
                {
                    name: "blackList",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.structfieldtype.blacklist"),
                },
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
                    name: "useOriginForUplimit",
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
                },
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
                    field: "useOriginForUplimit",
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
                    func: "schema.notscalarenumtype",
                    args: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "root",
                    type: RelationType.Type,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "type"
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
        desc: _LS("schema.structfieldtypes"),
        array: {
            element: "schema.structfieldtype",
            primary: ["name"],
        },
    },
    {
        name: "schema.getstructindexfields",
        type: SchemaType.Function,
        desc: "get indexable struct field names",
        func: {
            return: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "fields",
                    type: "schema.structfieldtypes"
                }
            ],
            exps: [],
            func: async (fields: any[]) => {
                const indexes: string[] = []

                for (let i = 0; i < fields.length; i++) {
                    if (await isStructFieldIndexable(fields[i] as IStructFieldConfig)) {
                        indexes.push(fields[i].name)
                    }
                }

                return indexes
            }
        }
    },
    {
        name: "schema.getrelationfuncreturn",
        type: SchemaType.Function,
        desc: "Gets the return type of the relation function",
        func: {
            return: "system.valuetype",
            args: [
                {
                    name: "fieldType",
                    type: "system.valuetype"
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
                        return await getArraySchema(fieldType, true) || NS_SYSTEM_ARRAY

                    case RelationType.LowLimit:
                    case RelationType.Uplimit:
                        if (await isSchemaCanBeUseAs(NS_SYSTEM_STRING, fieldType))
                            return NS_SYSTEM_INT
                        return fieldType

                    case RelationType.Invisible:
                    case RelationType.Disable:
                    case RelationType.Type:
                        return NS_SYSTEM_BOOL
                }
            }
        }
    },
    {
        name: "schema.getrelationwhitelist",
        type: SchemaType.Function,
        desc: "Gets the whitelist of the relations",
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
                        RelationType.WhiteList,
                        RelationType.LowLimit,
                        RelationType.Uplimit,
                        RelationType.Invisible,
                        RelationType.Disable,
                        RelationType.Assign,
                        RelationType.InitOnly,
                        RelationType.Type
                    ]
                }
                else if (typeInfo?.type === SchemaType.Enum) {
                    return [
                        RelationType.Default,
                        RelationType.Root,
                        RelationType.WhiteList,
                        RelationType.BlackList,
                        RelationType.Invisible,
                        RelationType.Disable,
                        RelationType.Assign,
                        RelationType.InitOnly,
                        RelationType.Type
                    ]
                }
                else if (typeInfo?.type === SchemaType.Struct) {
                    return [
                        RelationType.Invisible,
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
                    RelationType.Disable,
                    RelationType.Assign,
                    RelationType.InitOnly,
                    RelationType.Type
                ]
            }
        }
    },
    {
        name: "schema.getstructfieldtype",
        type: SchemaType.Function,
        desc: "Gets the struct field type",
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

                    if (schema?.type === SchemaType.Struct && schema.struct?.fields) {
                        tarField = schema.struct.fields.find(p => p.name === paths[i])
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
        desc: "Get struct field type by give type",
        func: {
            return: "system.valuetype",
            args: [
                {
                    name: "type",
                    type: "system.valuetype"
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
                let tarField = schema.struct?.fields.find(p => p.name === paths[0])
                for (let i = 1; i < paths.length; i++) {
                    if (!tarField) return null

                    schema = await getSchema(tarField.type)
                    if (schema?.type === SchemaType.Array && schema.array?.element) {
                        schema = await getSchema(schema.array!.element)
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
        name: "schema.structfldrelationinfo",
        type: SchemaType.Struct,
        desc: _LS("schema.structfldrelationinfo"),
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
                    type : "schema.valuetype",
                    display: _LS("schema.structfldrelationinfo.fieldtype"),
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
                            name: "relations.fieldType"
                        }
                    ]
                },
                {
                    field: "func",
                    type: RelationType.Root,
                    func: "schema.getrelationfuncreturn",
                    args: [
                        {
                            name: "fieldType"
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
        name: "schema.structfldrelationinfos",
        type: SchemaType.Array,
        desc: _LS("schema.structfldrelationinfos"),
        array: {
            element: "schema.structfldrelationinfo",
            primary: ["field", "type"],
        },
    },
    {
        name: "schema.structdefine",
        type: SchemaType.Struct,
        desc: _LS("schema.structdefine"),
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
        desc: "Whether the type is not a struct",
        func: {
            return: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: "schema.valuetype"
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
        name: "schema.datacombine",
        type: SchemaType.Struct,
        desc: _LS("schema.datacombine"),
        struct: {
            fields: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING
                },
                {
                    name: "type",
                    type: "schema.datacombinetype"
                }
            ]
        }
    },
    {
        name: "schema.datacombines",
        type: SchemaType.Array,
        desc: _LS("schema.datacombines"),
        array: {
            element: "schema.datacombine",
            primary: ["field"]
        }
    },
    {
        name: "schema.arraydefine",
        type: SchemaType.Struct,
        desc: _LS("schema.arraydefine"),
        struct: {
            fields: [
                {
                    name: "element",
                    type: "schema.arrayeletype",
                    display: _LS("schema.arraydefine.element"),
                },
                {
                    name: "primary",
                    type: NS_SYSTEM_STRINGS,
                    display: _LS("schema.arraydefine.primary"),
                },
                {
                    name: "combine",
                    type: "schema.datacombines",
                    display: _LS("schema.datacombines"),
                },
                {
                    name: "relations",
                    type: "schema.structfldrelationinfos",
                    display: "字段间关系申明",
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
                    field: "primary",
                    type: RelationType.WhiteList,
                    func: "schema.getstructindexfields",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "primary",
                    type: RelationType.BlackList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "primary"
                        }
                    ]
                },
                {
                    field: "combine",
                    type: RelationType.Invisible,
                    func: "schema.notstructtype",
                    args: [
                        {
                            name: "element"
                        }
                    ]
                },
                {
                    field: "combine.field",
                    type: RelationType.WhiteList,
                    func: "schema.getstructindexfields",
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
                {
                    field: "relations.type",
                    type: RelationType.WhiteList,
                    func: "schema.getrelationwhitelist",
                    args: [
                        {
                            name: "relations.fieldType"
                        }
                    ]
                },
                {
                    field: "relations.func",
                    type: RelationType.Root,
                    func: "schema.getrelationfuncreturn",
                    args: [
                        {
                            name: "relations.fieldType"
                        },
                        {
                            name: "relations.type"
                        }
                    ]
                }
            ]
        }
    },
    //#endregion

    //#region function definition
    {
        name: "schema.funcarg",
        type: SchemaType.Struct,
        desc: _LS("schema.funcarg"),
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
        desc: _LS("schema.funcargs"),
        array: {
            element: "schema.funcarg",
        },
    },
    {
        name: "schema.funccallarg",
        type: SchemaType.Struct,
        desc: _LS("schema.funccallarg"),
        struct: {
            fields: [
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
            ]
        }
    },
    {
        name: "schema.funccallargs",
        type: SchemaType.Array,
        desc: _LS("schema.funccallargs"),
        array: {
            element: "schema.funccallarg",
        },
    },
    {
        name: "schema.funcexp",
        type: SchemaType.Struct,
        desc: _LS("schema.funcexp"),
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
                    require: false,
                    displayOnly: false,
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
            ]
        }
    },
    {
        name: "schema.funcexps",
        type: SchemaType.Array,
        desc: "",
        array: {
            element: "schema.funcexp",
            primary: ["name"],
        },
    },
    {
        name: "schema.funcdefine",
        type: SchemaType.Struct,
        desc: _LS("schema.funcdefine"),
        struct: {
            fields: [
                {
                    name: "return",
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
            ],
        }
    },
    //#endregion

    //#region namespace defintion
    {
        name: "schema.namespacedefine",
        type: SchemaType.Struct,
        desc: _LS("schema.namespacedefine"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "schema.namespaceinput",
                    display: _LS("schema.namespacedefine.name"),
                },
                {
                    name: "type",
                    require: true,
                    type: "schema.schematype",
                    display: _LS("schema.namespacedefine.type"),
                    default: SchemaType.Namespace,
                },
                {
                    name: "desc",
                    require: true,
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.namespacedefine.desc"),
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
])

// View
import namespaceView from "./view/namespaceView.vue"
import { regSchemaTypeView } from "schema-node-vue-view"

regSchemaTypeView("schema.namespace", namespaceView)
regSchemaTypeView("schema.scalartype", namespaceView)
regSchemaTypeView("schema.enumtype", namespaceView)
regSchemaTypeView("schema.structtype", namespaceView)
regSchemaTypeView("schema.arraytype", namespaceView)
regSchemaTypeView("schema.functype", namespaceView)
regSchemaTypeView("schema.scalarenumtype", namespaceView)
regSchemaTypeView("schema.arrayeletype", namespaceView)
regSchemaTypeView("schema.valuetype", namespaceView)