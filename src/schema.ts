import { _L, _LS, ARRAY_ITSELF, EnumValueType, ExpressionType, getArraySchema, getCachedSchema, getScalarValueType, getSchema, isSchemaCanBeUseAs, isStructFieldIndexable, NS_SYSTEM_ARRAY, NS_SYSTEM_BOOL, NS_SYSTEM_DOUBLE, NS_SYSTEM_FLOAT, NS_SYSTEM_INT, NS_SYSTEM_INTS, NS_SYSTEM_NUMBER, NS_SYSTEM_STRING, NS_SYSTEM_STRINGS, registerSchema, RelationType, SchemaType, type IStructFieldConfig, type IStructScalarFieldConfig } from "schema-node"

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
            func: async (fieldType: string, relationType: any) => {
                switch (relationType) {
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
                    // 关联函数返回值类型
                    field: "func",
                    type: RelationType.Root,
                    func: "schema.getrelationfuncreturn",
                    args: [
                        {
                            name: "relations.fieldType"
                        },
                        {
                            name: "relations.relationType"
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

    //#region Array类型定义
    {
        name: "system.datadict.isnotstructtype",
        type: SchemaType.Function,
        desc: "不是结构体类型",
        function: {
            retType: "system.boolean",
            args: [
                {
                    name: "base",
                    type: NS_SYSTEM_STRING
                }
            ],
            exps: [],
            func: async (base: string) => {
                if (!base) return true
                const dataTypeInfo = await queryDataTypeInfo(base)
                return dataTypeInfo.type !== SchemaType.Struct
            }
        }
    },
    {
        name: "system.datadict.getarrayindexfields",
        type: SchemaType.Function,
        desc: "获取数组可用索引",
        function: {
            retType: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "base",
                    type: NS_SYSTEM_STRING
                }
            ],
            exps: [],
            func: async (base: string) => {
                if (!base) return []
                const dataTypeInfo = await queryDataTypeInfo(base)
                if (dataTypeInfo.type !== SchemaType.Struct) return []

                const indexes: string[] = []
                const fields = dataTypeInfo.struct?.fields || []

                for (let i = 0; i < fields.length; i++) {
                    const type = fields[i].type
                    if (await isIndexType(type, fields[i].upLimit ? parseInt(fields[i].upLimit) : undefined)) {
                        indexes.push(fields[i].name)
                    }
                }

                return indexes
            }
        }
    },
    {
        name: "system.arraydefinition",
        type: SchemaType.Struct,
        desc: "数组类型定义",
        struct: {
            fields: [
                {
                    name: "base",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.arrayeletype",
                    display: "元素数据类型",
                },
                {
                    name: "primary",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRINGS,
                    display: "作为主键的字段列表",
                },
                {
                    name: "indexes",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.structindexs",
                    display: "索引列表",
                },
                {
                    name: "valid",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    root: NS_SYSTEM_BOOL,
                    type: "schema.functype",
                    display: "数据验证用函数",
                },
                {
                    name: "joinMethods",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "system.categoryFieldjoinsettings",
                    display: "结果聚合配置",
                },
                {
                    name: "relations",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.structfldrelationinfos",
                    display: "字段间关系申明",
                },
            ],
            relations: [
                {
                    field: "primary",
                    relationType: RelationType.Invisible,
                    func: "system.datadict.isnotstructtype",
                    funcArgs: [
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    field: "indexes",
                    relationType: RelationType.Invisible,
                    func: "system.datadict.isnotstructtype",
                    funcArgs: [
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    field: "primary",
                    relationType: RelationType.EnumWhiteList,
                    func: "system.datadict.getarrayindexfields",
                    funcArgs: [
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    field: "indexes.fields",
                    relationType: RelationType.EnumWhiteList,
                    func: "system.datadict.getarrayindexfields",
                    funcArgs: [
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    field: "primary",
                    relationType: RelationType.EnumBlackList,
                    func: "system.conv.assign",
                    funcArgs: [
                        {
                            name: "primary"
                        }
                    ]
                },
                {
                    field: "indexes.fields",
                    relationType: RelationType.EnumBlackList,
                    func: "system.conv.assign",
                    funcArgs: [
                        {
                            name: "indexes.fields"
                        },
                        {
                            value: "name"
                        }
                    ]
                },
                {
                    // 聚合配置仅结果节点可用
                    field: "joinMethods",
                    relationType: RelationType.Invisible,
                    func: "system.datadict.isnotstructtype",
                    funcArgs: [
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    // 聚合配置可用字段
                    field: "joinMethods.field",
                    relationType: RelationType.EnumWhiteList,
                    func: "system.datadict.categorygetjoinfields",
                    funcArgs: [
                        {
                            value: "",
                        },
                        {
                            name: "base"
                        }
                    ]
                },
                {
                    // 关系
                    field: "relations.fieldType",
                    relationType: RelationType.Default,
                    func: "schema.getstructfieldtypebytype",
                    funcArgs: [
                        {
                            name: "base"
                        },
                        {
                            name: "relations.field"
                        }
                    ]
                },
                {
                    // 关联类型白名单
                    field: "relations.relationType",
                    relationType: RelationType.EnumWhiteList,
                    func: "schema.getrelationwhitelist",
                    funcArgs: [
                        {
                            name: "relations.fieldType"
                        }
                    ]
                },
                {
                    // 关联函数返回值类型
                    field: "relations.func",
                    type: RelationType.Root,
                    func: "schema.getrelationfuncreturn",
                    funcArgs: [
                        {
                            name: "relations.fieldType"
                        },
                        {
                            name: "relations.relationType"
                        }
                    ]
                }
            ]
        }
    },
    //#endregion

    //#region Function类型定义
    {
        name: "system.funcargument",
        type: SchemaType.Struct,
        desc: "函数参数配置",
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "名称",
                    upLimit: 32,
                },
                {
                    name: "type",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.valuetype",
                    display: "类型",
                },
                {
                    name: "nullable",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "允许为空",
                },
                {
                    name: "desc",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "描述",
                },
            ]
        }
    },
    {
        name: "system.funcarguments",
        type: SchemaType.Array,
        desc: "函数参数配置列表",
        array: {
            base: "system.funcargument",
            primary: [],
            valid: ""
        },
    },
    {
        name: "system.funccallargument",
        type: SchemaType.Struct,
        desc: "函数调用参数",
        struct: {
            fields: [
                {
                    name: "name",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "表达式",
                    upLimit: 32,
                },
                {
                    name: "value",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.anyvalue",
                    display: "常量",
                },
            ]
        }
    },
    {
        name: "system.funccallarguments",
        type: SchemaType.Array,
        desc: "函数调用参数列表",
        array: {
            base: "system.funccallargument",
            primary: [],
            valid: ""
        },
    },
    {
        name: "system.funcexpression",
        type: SchemaType.Struct,
        desc: "函数表达式配置",
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "表达式名称",
                    upLimit: 32,
                },
                {
                    name: "callType",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.exptype",
                    default: "" + ExpressionType.Call,
                    display: "调用方式",
                },
                {
                    name: "callFunc",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.functype",
                    display: "调用函数",
                },
                {
                    name: "type",
                    require: false,
                    displayOnly: false,
                    type: "schema.valuetype",
                    display: "返回类型",
                },
                {
                    name: "args",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "system.funccallarguments",
                    display: "调用参数列表",
                }
            ],
            relations: [
                /*{
                  field: "args",
                  relationType: RelationType.Invisible,
                  func: "system.logic.isnull",
                  funcArgs: [
                    {
                      name: "callFunc"
                    }
                  ]
                }*/
            ]
        }
    },
    {
        name: "system.funcexpressions",
        type: SchemaType.Array,
        desc: "函数表达式列表",
        array: {
            base: "system.funcexpression",
            primary: ["name"],
            valid: ""
        },
    },
    {
        name: "system.funcdefinition",
        type: SchemaType.Struct,
        desc: "函数类型定义",
        struct: {
            fields: [
                {
                    name: "retType",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.valuetype",
                    display: "返回值类型",
                    upLimit: 128,
                },
                {
                    name: "args",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "system.funcarguments",
                    display: "函数参数列表",
                },
                {
                    name: "exps",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "system.funcexpressions",
                    display: "函数表达式列表",
                },
            ],
            relations: [
                /*{
                  field: "exps.args.name",
                  relationType: RelationType.EnumWhiteList,
                  func: "system.getfunccallexpnamelist",
                  funcArgs: [
                    {
                      name: "args",
                    },
                    {
                      name: "exps",
                    }
                  ]
                }*/
            ]
        }
    },
    // 函数
    {
        name: "system.getfunccallexpnamelist",
        type: SchemaType.Function,
        function: {
            retType: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "args",
                    type: "system.funcarguments"
                },
                {
                    name: "exps",
                    type: "system.funcexpressions"
                }
            ],
            exps: [],
            func: (args: any[], exps: any[]) => {
                return [...args.map(a => a.name), ...exps.map(e => e.name)]
            }
        }
    },
    {
        name: "system.getfunccallenumroot",
        type: SchemaType.Function,
        desc: "基于表达式类型确定函数返回值",
        func: {
            retType: NS_SYSTEM_STRING,
            args: [
                {
                    name: "callType",
                    type: "schema.exptype",
                },
                {
                    name: "type",
                    type: NS_SYSTEM_STRING,
                    nullable: true
                }
            ],
            exps: [],
            func: async (callType: ExpressionType, type?: string) => {
                if (isNull(type)) return ""

                switch (callType) {
                    case ExpressionType.Map:
                    case ExpressionType.Filter:
                        {
                            const typeInfo = await queryDataTypeInfo(type!)
                            return typeInfo?.type === SchemaType.Array && typeInfo.array?.base || type
                        }

                    default:
                        return type
                }
            }
        }
    },
    //#endregion

    //#region 命名空间
    {
        name: "system.namespacedefinition",
        type: SchemaType.Struct,
        desc: "命名空间定义",
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.namespaceinput",
                    display: "名称",
                    upLimit: 128,
                },
                {
                    name: "type",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.schematype",
                    display: "类型",
                    default: "" + SchemaType.Namspace,
                },
                {
                    name: "desc",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "描述",
                    upLimit: 128,
                },
                {
                    name: "scalar",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.scalardefine",
                    display: "基础数据类型定义",
                },
                {
                    name: "enum",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.enumdefine", ",
          display : "枚举类型定义",
                },
                {
                    name: "struct",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.structdefine",
                    display: "结构体类型定义",
                },
                {
                    name: "array",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "system.arraydefinition",
                    display: "数组类型定义",
                },
                {
                    name: "function",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "system.funcdefinition",
                    display: "函数定义",
                },
            ],
            relations: [
                {
                    field: "scalar",
                    relationType: RelationType.Invisible,
                    func: "system.logic.notequal",
                    funcArgs: [
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
                    relationType: RelationType.Invisible,
                    func: "system.logic.notequal",
                    funcArgs: [
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
                    relationType: RelationType.Invisible,
                    func: "system.logic.notequal",
                    funcArgs: [
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
                    relationType: RelationType.Invisible,
                    func: "system.logic.notequal",
                    funcArgs: [
                        {
                            name: "type"
                        },
                        {
                            value: SchemaType.Array
                        }
                    ]
                },
                {
                    field: "function",
                    relationType: RelationType.Invisible,
                    func: "system.logic.notequal",
                    funcArgs: [
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