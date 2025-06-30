import { _L, _LS, ARRAY_ITSELF, EnumValueType, ExpressionType, NS_SYSTEM_BOOL, NS_SYSTEM_DOUBLE, NS_SYSTEM_FLOAT, NS_SYSTEM_INT, NS_SYSTEM_INTS, NS_SYSTEM_NUMBER, NS_SYSTEM_STRING, NS_SYSTEM_STRINGS, registerSchema, RelationType, SchemaType, type IStructScalarFieldConfig } from "schema-node"

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
                    value: RelationType.EnumRoot,
                    name: _LS("schema.relationtype.enumroot"),
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
        desc: "函数参数申明列表",
        array: {
            element: "schema.structfldfuncarg",
        },
    },
    {
        name: "system.structfieldtype",
        type: SchemaType.Struct,
        desc: _LS("system.structfieldtype"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "schema.varname",
                    display: _LS("system.structfieldtype.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "schema.valuetype",
                    display: _LS("system.structfieldtype.type"),
                },
                {
                    name: "require",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "必填",
                },
                {
                    name: "immutable",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "不允许修改",
                },
                {
                    name: "invisible",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "不显示",
                },
                {
                    name: "displayOnly",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "仅显示用",
                },
                {
                    name: "unit",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "字面量单位",
                    upLimit: 16,
                },
                {
                    name: "display",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "中文名",
                    upLimit: 64,
                },
                {
                    name: "desc",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "描述",
                    upLimit: 255,
                },
                {
                    name: "default",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "默认值",
                },
                {
                    name: "enumCascade",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_INT,
                    display: "级联枚举值限制层级",
                },
                {
                    name: "enumRoot",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "枚举值根值",
                },
                {
                    name: "enumWhiteList",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRINGS,
                    display: "枚举值白名单",
                },
                {
                    name: "enumBlackList",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRINGS,
                    display: "枚举值黑名单",
                },
                {
                    name: "enumAnyLevel",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "枚举值任意级可选",
                },
                {
                    name: "enumSingleFlag",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "单选标志位",
                    relations: [
                        {
                            relationType: RelationType.Invisible,
                            func: "system.datadict.notflagenum",
                            funcArgs: [
                                {
                                    name: "type"
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "asSuggest",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "白名单仅作为推荐",
                },
                {
                    name: "useOriginForUplimit",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_BOOL,
                    display: "计算上限时计入原始值",
                },
                {
                    name: "lowLimit",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "下限值",
                },
                {
                    name: "upLimit",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "上限值",
                },
                {
                    name: "valid",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    enumRoot: NS_SYSTEM_BOOL,
                    type: "schema.functype",
                    display: "校验函数",
                },
                {
                    name: "validArgs",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.structfldfuncargs",
                    display: "校验函数参数",
                },
                {
                    name: "validError",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: NS_SYSTEM_STRING,
                    display: "校验错误消息",
                },
                {
                    name: "relations",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "system.structfieldselfrelationinfos",
                    display: "字段关联",
                },
            ],
            relations: [
                // 验证
                {
                    field: "valid",
                    relationType: RelationType.Invisible,
                    func: "system.logic.isnull",
                    funcArgs: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "validArgs",
                    relationType: RelationType.Invisible,
                    func: "system.logic.isnull",
                    funcArgs: [
                        {
                            name: "valid"
                        }
                    ]
                },
                {
                    field: "validError",
                    relationType: RelationType.Invisible,
                    func: "system.logic.isnull",
                    funcArgs: [
                        {
                            name: "valid"
                        }
                    ]
                },
                // 关联
                {
                    field: "relations.func",
                    relationType: RelationType.EnumRoot,
                    func: "system.datadict.getrelationfuncroot",
                    funcArgs: [
                        {
                            name: "type"
                        },
                        {
                            name: "relations.relationType"
                        }
                    ]
                },
                {
                    field: "relations.relationType",
                    relationType: RelationType.EnumWhiteList,
                    func: "system.datadict.getrealtionwhitelist",
                    funcArgs: [
                        {
                            name: "type"
                        }
                    ]
                },
                {
                    field: "relations.relationType",
                    relationType: RelationType.EnumBlackList,
                    func: "system.collection.arraymap",
                    funcArgs: [
                        {
                            name: "relations"
                        },
                        {
                            value: "relationType"
                        }
                    ]
                }
            ]
        }
    },
    {
        name: "system.structfieldtypes",
        type: SchemaType.Array,
        desc: "结构体类型字段列表",
        array: {
            base: "system.structfieldtype",
            primary: ["name"],
            valid: ""
        },
    },
    {
        name: "system.datadict.getstructindexfields",
        type: SchemaType.Function,
        desc: "获取结构体字段可用索引",
        function: {
            retType: NS_SYSTEM_STRINGS,
            args: [
                {
                    name: "fields",
                    type: "system.structfieldtypes"
                }
            ],
            exps: [],
            func: async (fields: any[]) => {
                const indexes: string[] = []

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
        name: "system.datadict.getrelationfuncroot",
        type: SchemaType.Function,
        desc: "获取函数关联用函数返回值类型",
        function: {
            retType: NS_SYSTEM_STRING,
            args: [
                {
                    name: "fieldType",
                    type: NS_SYSTEM_STRING
                },
                {
                    name: "relationType",
                    type: "schema.relationtype"
                }
            ],
            exps: [],
            func: async (fieldType: string, relationType: any) => {
                switch (relationType) {
                    // 默认值
                    case RelationType.Default:
                    case RelationType.Assign:
                    case RelationType.InitOnly:
                        return fieldType

                    // 根枚举值
                    case RelationType.EnumRoot:
                        return fieldType

                    // 白名单 X 黑名单
                    case RelationType.WhiteList:
                    case RelationType.BlackList:
                        const typeInfo = await queryDataTypeInfo(fieldType)
                        return typeInfo?.type === SchemaType.Enum ? typeInfo.enum?.arrayType
                            : typeInfo?.type === SchemaType.Scalar ? typeInfo?.scalar?.arrayType
                                : "system.array"

                    // 下限 X 上限
                    case RelationType.LowLimit:
                    case RelationType.Uplimit:
                        if (await canbeUseAs(NS_SYSTEM_STRING, fieldType)) // 字符串类，使用长度限制
                            return NS_SYSTEM_INT
                        return fieldType

                    // 不可见 X 不可用 X 仅建议
                    case RelationType.Invisible:
                    case RelationType.Disable:
                    case RelationType.AsSuggest:
                        return NS_SYSTEM_BOOL
                }
            }
        }
    },
    {
        name: "system.datadict.getrealtionwhitelist",
        type: SchemaType.Function,
        desc: "获取指定类型的关系白名单",
        function: {
            retType: "system.ints",
            args: [
                {
                    name: "fieldType",
                    type: NS_SYSTEM_STRING
                }
            ],
            exps: [],
            func: async (fieldType: string) => {
                if (!fieldType) return []
                const typeInfo = fieldType ? await queryDataTypeInfo(fieldType) : null
                if (typeInfo?.type === SchemaType.Scalar) {
                    return [
                        RelationType.Default,
                        RelationType.EnumWhiteList,
                        RelationType.LowLimit,
                        RelationType.Uplimit,
                        RelationType.Invisible,
                        RelationType.Disable,
                        RelationType.Assign,
                        RelationType.AsSuggest,
                        RelationType.InitOnly,
                    ]
                }
                else if (typeInfo?.type === SchemaType.Enum) {
                    return [
                        RelationType.Default,
                        RelationType.EnumRoot,
                        RelationType.EnumCascade,
                        RelationType.EnumWhiteList,
                        RelationType.EnumBlackList,
                        RelationType.Invisible,
                        RelationType.Disable,
                        RelationType.Assign,
                        RelationType.InitOnly,
                    ]
                }
                else if (typeInfo?.type === SchemaType.Struct) {
                    return [
                        RelationType.Invisible,
                        RelationType.Disable,
                        RelationType.Assign,
                    ]
                }
                return [
                    RelationType.Default,
                    RelationType.EnumRoot,
                    RelationType.EnumWhiteList,
                    RelationType.EnumBlackList,
                    RelationType.Invisible,
                    RelationType.Disable,
                    RelationType.Assign,
                    RelationType.InitOnly,
                ]
            }
        }
    },
    {
        name: "system.datadict.getstructfieldtype",
        type: SchemaType.Function,
        desc: "获取字段类型",
        function: {
            retType: NS_SYSTEM_STRING,
            args: [
                {
                    name: "field",
                    type: NS_SYSTEM_STRING
                },
                {
                    name: "fields",
                    type: "system.structfieldtypes"
                }
            ],
            exps: [],
            func: async (field: string, fields: any[]) => {
                const paths = (field || "").split(".")
                if (paths.length === 0) return null
                let tarField = (fields || []).find(p => p.name === paths[0])
                for (let i = 1; i < paths.length; i++) {
                    if (!tarField) return null

                    let typeInfo = await queryDataTypeInfo(tarField.type)
                    if (typeInfo?.type === SchemaType.Array && typeInfo.array?.base) {
                        typeInfo = await queryDataTypeInfo(typeInfo.array!.base)
                    }

                    if (typeInfo?.type === SchemaType.Struct && typeInfo.struct?.fields) {
                        tarField = typeInfo.struct.fields.find(p => p.name === paths[i])
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
        name: "system.datadict.notflagenum",
        type: SchemaType.Function,
        desc: "是否标志位枚举",
        function: {
            retType: NS_SYSTEM_BOOL,
            args: [
                {
                    name: "type",
                    type: NS_SYSTEM_STRING
                }
            ],
            exps: [],
            func: async (type: string) => {
                if (!type) return true
                const typeInfo = type ? await queryDataTypeInfo(type) : null
                return !(type && typeInfo?.type === SchemaType.Enum && typeInfo?.enum?.flags)
            }
        }
    },
    {
        name: "system.datadict.getstructfieldtypebytype",
        type: SchemaType.Function,
        desc: "获取字段类型",
        function: {
            retType: NS_SYSTEM_STRING,
            args: [
                {
                    name: "type",
                    type: NS_SYSTEM_STRING
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

                let typeInfo = await queryDataTypeInfo(type)
                let tarField = typeInfo.struct?.fields.find(p => p.name === paths[0])
                for (let i = 1; i < paths.length; i++) {
                    if (!tarField) return null

                    typeInfo = await queryDataTypeInfo(tarField.type)
                    if (typeInfo?.type === SchemaType.Array && typeInfo.array?.base) {
                        typeInfo = await queryDataTypeInfo(typeInfo.array!.base)
                    }

                    if (typeInfo?.type === SchemaType.Struct && typeInfo.struct?.fields) {
                        tarField = typeInfo.struct.fields.find(p => p.name === paths[i])
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
        name: "system.structfieldselfrelationinfo",
        type: SchemaType.Struct,
        desc: "字段数据关联",
        struct: {
            fields: [
                {
                    name: "relationType",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.relationtype",
                    display: "函数结果用途"
                },
                {
                    name: "func",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.functype",
                    display: "关系函数",
                },
                {
                    name: "funcArgs",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.structfldfuncargs",
                    display: "函数参数",
                },
            ]
        }
    },
    {
        name: "system.structfieldselfrelationinfos",
        type: SchemaType.Array,
        desc: "字段数据关联列表",
        array: {
            base: "system.structfieldselfrelationinfo",
            primary: ["relationType"],
            valid: ""
        },
    },
    {
        name: "system.structfieldrelationinfo",
        type: SchemaType.Struct,
        desc: "字段数据关联",
        struct: {
            fields: [
                {
                    name: "field",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.reltarfield",
                    display: "目标字段",
                },
                {
                    name: "fieldType",
                    require: false,
                    immutable: false,
                    displayOnly: true,
                    type: NS_SYSTEM_STRING,
                    display: "字段类型",
                },
                {
                    name: "relationType",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.relationtype",
                    display: "函数结果用途",
                },
                {
                    name: "func",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.functype",
                    display: "关系函数",
                },
                {
                    name: "funcArgs",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.structfldfuncargs",
                    display: "函数参数",
                },
            ]
        }
    },
    {
        name: "system.structfieldrelationinfos",
        type: SchemaType.Array,
        desc: "字段数据关联列表",
        array: {
            base: "system.structfieldrelationinfo",
            primary: ["field", "relationType"],
            valid: ""
        },
    },
    {
        name: "system.structdefinition",
        type: SchemaType.Struct,
        desc: "结构体类型定义",
        struct: {
            fields: [
                {
                    name: "base",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "schema.structtype",
                    display: "基础结构体类型",
                },
                {
                    name: "fields",
                    require: true,
                    immutable: false,
                    displayOnly: false,
                    type: "system.structfieldtypes",
                    display: "结构体类型字段列表",
                    upLimit: 128,
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
                    name: "relations",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    type: "system.structfieldrelationinfos",
                    display: "字段间关系申明",
                },
                {
                    name: "valid",
                    require: false,
                    immutable: false,
                    displayOnly: false,
                    enumRoot: NS_SYSTEM_BOOL,
                    type: "schema.functype",
                    display: "数据验证用函数",
                },
            ],
            relations: [
                // 索引
                {
                    field: "indexes.fields",
                    relationType: RelationType.EnumWhiteList,
                    func: "system.datadict.getstructindexfields",
                    funcArgs: [
                        {
                            name: "fields"
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
                        }
                    ]
                },
                // 关联
                {
                    // 关联数据类型
                    field: "relations.fieldType",
                    relationType: RelationType.Default,
                    func: "system.datadict.getstructfieldtype",
                    funcArgs: [
                        {
                            name: "relations.field"
                        },
                        {
                            name: "fields"
                        }
                    ]
                },
                {
                    // 关联类型白名单
                    field: "relations.relationType",
                    relationType: RelationType.EnumWhiteList,
                    func: "system.datadict.getrealtionwhitelist",
                    funcArgs: [
                        {
                            name: "relations.fieldType"
                        }
                    ]
                },
                {
                    // 关联函数返回值类型
                    field: "relations.func",
                    relationType: RelationType.EnumRoot,
                    func: "system.datadict.getrelationfuncroot",
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
                    enumRoot: NS_SYSTEM_BOOL,
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
                    type: "system.structfieldrelationinfos",
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
                    func: "system.datadict.getstructfieldtypebytype",
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
                    func: "system.datadict.getrealtionwhitelist",
                    funcArgs: [
                        {
                            name: "relations.fieldType"
                        }
                    ]
                },
                {
                    // 关联函数返回值类型
                    field: "relations.func",
                    relationType: RelationType.EnumRoot,
                    func: "system.datadict.getrelationfuncroot",
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
        function: {
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
                    type: "system.structdefinition",
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