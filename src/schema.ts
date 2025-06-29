import { EnumValueType, ExpressionType, NS_SYSTEM_STRING, RelationType, SchemaType } from "schema-node"

registerFrontendDataType([
  //#region  基础类型
  {
    name : "schema.namespace",
    type : SchemaType.Scalar,
    desc : "命名空间",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的命名空间无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.varname",
    type : SchemaType.Scalar,
    desc : "字段名",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所输入的{0}无效",
      regex : "^[a-zA-Z]\\w*$",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.valuetype",
    type : SchemaType.Scalar,
    desc : "任意数据类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的数据类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.scalartype",
    type : SchemaType.Scalar,
    desc : "基础数据类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的基础数据类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.enumtype",
    type : SchemaType.Scalar,
    desc : "枚举类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的枚举类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.scalarenumtype",
    type : SchemaType.Scalar,
    desc : "枚举或基础数据类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的数据类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.structtype",
    type : SchemaType.Scalar,
    desc : "结构体类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的结构体类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.arrayeletype",
    type : SchemaType.Scalar,
    desc : "非数组数据类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的非数组数据类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.arraytype",
    type : SchemaType.Scalar,
    desc : "数组类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的数组类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.functype",
    type : SchemaType.Scalar,
    desc : "函数类型",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : null,
      error : "所选的函数类型无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  {
    name : "schema.namespaceinput",
    type : SchemaType.Scalar,
    desc : "命名空间录入用",
    scalar : {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : 128,
      error : "所输入的命名空间名称无效。",
      regex : "^[a-z]\\w*(\.[a-z]\\w*)*$",
      valid : "",
      conv : ""
    }
  },
  {
    name: "schema.reltarfield",
    type: SchemaType.Scalar,
    desc: "关联目标字段",
    scalar: {
      base : NS_SYSTEM_STRING,
      lowLimit : null,
      upLimit : 128,
      error : "所选的字段无效。",
      regex : "",
      valid : "",
      conv : ""
    }
  },
  //#endregion

  //#region  枚举值
  {
    name : "schema.schematype",
    type : SchemaType.Enum,
    desc : "数据类型",
    enum : {
      base : "system.int",
      type : EnumValueType.Int,
      cascade : [],
      values : [
        {
          value : SchemaType.Namespace,
          zhName : "命名空间",
        },
        {
          value : SchemaType.Enum,
          zhName : "枚举类型",
        },
        {
          value : SchemaType.Scalar,
          zhName : "基础数据类型",
        },
        {
          value : SchemaType.Struct,
          zhName : "结构体类型",
        },
        {
          value : SchemaType.Array,
          zhName : "数组类型",
        },
        {
          value : SchemaType.Function,
          zhName : "函数类型",
        }
      ]
    }
  },
  {
    name : "schema.relationtype",
    type : SchemaType.Enum,
    desc : "字段计算结果用途",
    enum : {
      base : "system.int",
      type : EnumValueType.Int,
      cascade : [],
      values : [
        {
          value : RelationType.Default,
          zhName : "默认值计算",
        },
        {
          value : RelationType.EnumRoot,
          zhName : "枚举值根值",
        },
        {
          value : RelationType.BlackList,
          zhName : "枚举值黑名单",
        },
        {
          value : RelationType.WhiteList,
          zhName : "枚举值白名单",
        },
        {
          value : RelationType.LowLimit,
          zhName : "下限",
        },
        {
          value : RelationType.Uplimit,
          zhName : "上限",
        },
        {
          value : RelationType.Invisible,
          zhName : "不可见",
        },
        {
          value: RelationType.Disable,
          zhName: "不可用",
        },
        {
          value: RelationType.Assign,
          zhName: "强制赋值",
        },
        {
          value:RelationType.InitOnly,
          zhName: "仅初始化用",
        }
      ]
    }
  },
  {
    name : "schema.exptype",
    type : SchemaType.Enum,
    desc : "函数表达式调用方式",
    enum : {
      base : "system.int",
      type : EnumValueType.Int,
      cascade : [],
      values : [
        {
          value : ExpressionType.Call,
          zhName : "直接调用",
        },
        {
          value : ExpressionType.Map,
          zhName : "数组映射",
        },
        {
          value : ExpressionType.Reduce,
          zhName : "数组归约",
        },
        {
          value : ExpressionType.First,
          zhName : "首先满足",
        },
        {
          value : ExpressionType.Last,
          zhName : "最后满足",
        },
        {
          value : ExpressionType.Filter,
          zhName : "过滤",
        },
      ]
    }
  },
  //#endregion

  //#region Scalar类型定义体
  {
    name : "schema.scalardefine",
    type : SchemaType.Struct,
    desc : "基础结构体类型定义",
    struct : {
      fields : [
        {
          name : "base",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.scalartype",
          display : "原始基础数据类型",
        },
        {
          name : "unit",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "字面量单位",
          upLimit : 8,
        },
        {
          name : "lowLimit",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.number",
          display : "值下限",
        },
        {
          name : "upLimit",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.number",
          display : "值上限",
        },
        {
          name : "error",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "错误消息",
          upLimit : 128,
        },
        {
          name : "regex",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "正则表达式",
        },
        {
          name : "valid",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "Eval验证表达式",
        },
        {
          name : "conv",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "Eval转换表达式",
        },
      ]
    },
  },
  //#endregion

  //#region Enum类型定义体
  {
    name : "schema.enumvalueinfo",
    type : SchemaType.Struct,
    desc : "枚举字段信息",
    struct : {
      fields : [
        {
          name : "value",
          require : true,
          immutable : true,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display: "枚举值",
          upLimit: 64
        },
        {
          name : "enName",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "枚举英文名",
          upLimit: 64
        },
        {
          name : "zhName",
          require : true,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "枚举中文名",
          upLimit: 64
        },
        {
          name : "note1",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "备注1",
          upLimit: 64
        },
        {
          name : "note2",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "备注2",
          upLimit: 64
        },
        {
          name : "disable",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "停用",
        },
        {
          name : "selected",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "继承",
        },
        {
          name: "hasSubList",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "有子元素",
        }
      ]
    },
  },
  {
    name : "schema.enumvalueinfos",
    type : SchemaType.Array,
    desc : "枚举字段信息列表",
    array : {
      base : "schema.enumvalueinfo",
      primary : [ "value" ],
      valid : ""
    },
  },
  {
    name : "schema.enumintvalueinfo",
    type : SchemaType.Struct,
    desc : "枚举字段信息",
    struct : {
      fields : [
        {
          name : "value",
          require : true,
          immutable : true,
          displayOnly : false,
          type : "system.int",
          display: "枚举值",
        },
        {
          name : "enName",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "枚举英文名",
          upLimit: 64
        },
        {
          name : "zhName",
          require : true,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "枚举中文名",
          upLimit: 64
        },
        {
          name : "note1",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "备注1",
          upLimit: 64
        },
        {
          name : "note2",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "备注2",
          upLimit: 64
        },
        {
          name : "disable",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "停用",
        },
        {
          name : "selected",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "继承",
        },
        {
          name: "hasSubList",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "有子元素",
        }
      ]
    },
  },
  {
    name : "schema.enumintvalueinfos",
    type : SchemaType.Array,
    desc : "枚举字段信息列表",
    array : {
      base : "schema.enumintvalueinfo",
      primary : [ "value" ],
      valid : ""
    },
  },
  {
    name : "schema.enumnumbervalueinfo",
    type : SchemaType.Struct,
    desc : "枚举字段信息",
    struct : {
      fields : [
        {
          name : "value",
          require : true,
          immutable : true,
          displayOnly : false,
          type : "system.number",
          display: "枚举值",
        },
        {
          name : "enName",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "枚举英文名",
          upLimit: 64
        },
        {
          name : "zhName",
          require : true,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "枚举中文名",
          upLimit: 64
        },
        {
          name : "note1",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "备注1",
          upLimit: 64
        },
        {
          name : "note2",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "备注2",
          upLimit: 64
        },
        {
          name : "disable",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "停用",
        },
        {
          name : "selected",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "继承",
        },
        {
          name: "hasSubList",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "有子元素",
        }
      ]
    },
  },
  {
    name : "schema.enumnumbervalueinfos",
    type : SchemaType.Array,
    desc : "枚举字段信息列表",
    array : {
      base : "schema.enumnumbervalueinfo",
      primary : [ "value" ],
      valid : ""
    },
  },
  {
    name: "schema.calcnextflag",
    type: SchemaType.Function,
    desc: "计算下一个标志枚举值",
    function: {
      retType: "system.int",
      args: [
        {
          name: "values",
          type: "system.array",
        }
      ],
      exps: [],
      func: (values: any[]) => {
        if(!Array.isArray(values) || values.length == 0) return 0
        const last = values[values.length - 1]
        return !last?.value ? 1 : last.value * 2
      }
    }
  },
  {
    name : "schema.enumflagsvalueinfos",
    type : SchemaType.Array,
    desc : "标志枚举字段信息列表",
    array : {
      base : "schema.enumintvalueinfo",
      primary : [ "value" ],
      valid : "",
      relations: [
        {
          field: "value",
          relationType: RelationType.Assign,
          func: "schema.calcnextflag",
          funcArgs: [
            {
              "name": "$array"
            }
          ]
        }
      ]
    },
  },

  {
    name: "schema.isenumtype",
    type: SchemaType.Function,
    desc: "是否枚举值类型",
    function: {
      retType: "system.boolean",
      args: [
        {
          name: "type",
          type: NS_SYSTEM_STRING
        }
      ],
      exps: [],
      func: async (type: string) => {
        if(!type) return false
        const typeInfo = await queryDataTypeInfo(type)
        return typeInfo?.type === SchemaType.Enum
      }
    }
  },
  {
    name : "schema.enumdefine",
    type : SchemaType.Struct,
    desc : "枚举类型定义",
    struct : {
      fields : [
        {
          name : "base",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.scalarenumtype",
          display: "基础类型",
          default: "system.int",
        },
        {
          name: "flags",
          require: false,
          immutable: true,
          type: "system.bool",
          display: "标志枚举值",
        },
        {
          name : "cascade",
          require : false,
          immutable : true,
          displayOnly : false,
          type : "system.strings",
          display : "级联名称列表",
          relations: [
            {
              relationType: RelationType.Disable,
              func: "system.conv.assign",
              funcArgs: [
                {
                  name: "flags"
                }
              ]
            }
          ]
        },
        {
          name : "values",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "schema.enumvalueinfos",
          display : "枚举字段信息列表",
        },
      ],
      relations: [
        {
          field: "cascade",
          relationType: RelationType.Invisible,
          func: "schema.isenumtype",
          funcArgs: [
            {
              name: "base"
            }
          ]
        }
      ]
    }
  },
  //#endregion

  //#region Struct类型定义
  {
    name : ".datatableindex",
    type : SchemaType.Struct,
    desc : "结构索引",
    struct : {
      fields : [
        {
          name : "fields",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "system.strings",
          display : "索引列",
        },
        {
          name : "unique",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "唯一",
        },
      ]
    }
  },
  {
    name : "system.datatableindexs",
    type : SchemaType.Array,
    desc : "结构索引列表",
    array : {
      base : ".datatableindex",
      primary : [],
      valid : ""
    },
  },
  {
    name : "system.structfieldfuncargument",
    type : SchemaType.Struct,
    desc : "函数参数申明",
    struct : {
      fields : [
        {
          name : "name",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "schema.reltarfield",
          display : "字段",
        },
        {
          name : "value",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.anyvalue",
          display : "值",
        },
      ]
    }
  },
  {
    name : "system.structfieldfuncarguments",
    type : SchemaType.Array,
    desc : "函数参数申明列表",
    array : {
      base : "system.structfieldfuncargument",
      primary : [],
      valid : ""
    },
  },
  {
    name : "system.structfieldtype",
    type : SchemaType.Struct,
    desc : "结构体类型字段信息",
    struct : {
      fields : [
        {
          name : "name",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.varname",
          display : "字段英文名",
          upLimit : 32,
        },
        {
          name : "type",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.valuetype",
          display : "字段类型",
        },
        {
          name : "require",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "必填",
        },
        {
          name : "immutable",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "不允许修改",
        },
        {
          name : "invisible",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "不显示",
        },
        {
          name : "displayOnly",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "仅显示用",
        },
        {
          name : "unit",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "字面量单位",
          upLimit : 16,
        },
        {
          name : "display",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "中文名",
          upLimit : 64,
        },
        {
          name : "desc",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "描述",
          upLimit : 255,
        },
        {
          name : "default",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "默认值",
        },
        {
          name : "enumCascade",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.int",
          display : "级联枚举值限制层级",
        },
        {
          name : "enumRoot",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "枚举值根值",
        },
        {
          name : "enumWhiteList",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.strings",
          display : "枚举值白名单",
        },
        {
          name : "enumBlackList",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.strings",
          display : "枚举值黑名单",
        },
        {
          name : "enumAnyLevel",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "枚举值任意级可选",
        },
        {
          name: "enumSingleFlag",
          require: false,
          immutable: false,
          displayOnly: false,
          type: "system.bool",
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
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "白名单仅作为推荐",
        },
        {
          name: "useOriginForUplimit",
          require: false,
          immutable: false,
          displayOnly: false,
          type: "system.bool",
          display: "计算上限时计入原始值",
        },
        {
          name : "lowLimit",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "下限值",
        },
        {
          name : "upLimit",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "上限值",
        },
        {
          name : "valid",
          require : false,
          immutable : false,
          displayOnly: false,
          enumRoot: "system.bool",
          type : "schema.functype",
          display : "校验函数",
        },
        {
          name : "validArgs",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.structfieldfuncarguments",
          display : "校验函数参数",
        },
        {
          name : "validError",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "校验错误消息",
        },
        {
          name : "relations",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.structfieldselfrelationinfos",
          display : "字段关联",
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
    name : "system.structfieldtypes",
    type : SchemaType.Array,
    desc : "结构体类型字段列表",
    array : {
      base : "system.structfieldtype",
      primary : [ "name" ],
      valid : ""
    },
  },
  {
    name: "system.datadict.getstructindexfields",
    type: SchemaType.Function,
    desc: "获取结构体字段可用索引",
    function: {
      retType: "system.strings",
      args: [
        {
          name: "fields",
          type: "system.structfieldtypes"
        }
      ],
      exps: [],
      func: async (fields: any[]) => {
        const indexes: string[] = []

        for (let i = 0; i < fields.length; i++)
        {
          const type = fields[i].type
          if (await isIndexType(type, fields[i].upLimit ? parseInt(fields[i].upLimit) : undefined))
          {
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
      func: async (fieldType: string, relationType: number) => {
        switch (relationType) {
          // 默认值
          case RelationType.Default:
          case RelationType.Assign:
          case RelationType.InitOnly:
            return fieldType

          // 根枚举值
          case RelationType.EnumRoot:
            return fieldType

          // 级联枚举值限制层级
          case RelationType.EnumCascade:
            return "system.int"

          // 白名单 X 黑名单
          case RelationType.EnumWhiteList:
          case RelationType.EnumBlackList:
            const typeInfo = await queryDataTypeInfo(fieldType)
            return typeInfo?.type === SchemaType.Enum ? typeInfo.enum?.arrayType
              : typeInfo?.type === SchemaType.Scalar ? typeInfo?.scalar?.arrayType
                : "system.array"

          // 下限 X 上限
          case RelationType.LowLimit:
          case RelationType.Uplimit:
            if (await canbeUseAs(NS_SYSTEM_STRING, fieldType)) // 字符串类，使用长度限制
              return "system.int"
            return fieldType

          // 不可见 X 不可用 X 仅建议
          case RelationType.Invisible:
          case RelationType.Disable:
          case RelationType.AsSuggest:
            return "system.bool"
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
        if (typeInfo?.type === SchemaType.Scalar)
        {
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
        else if (typeInfo?.type === SchemaType.Enum)
        {
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
        else if (typeInfo?.type === SchemaType.Struct)
        {
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
        for (let i = 1; i < paths.length; i++)
        {
          if (!tarField) return null

          let typeInfo = await queryDataTypeInfo(tarField.type)
          if (typeInfo?.type === SchemaType.Array && typeInfo.array?.base)
          {
            typeInfo = await queryDataTypeInfo(typeInfo.array!.base)
          }

          if (typeInfo?.type === SchemaType.Struct && typeInfo.struct?.fields)
          {
            tarField = typeInfo.struct.fields.find(p => p.name === paths[i])
          }
          else
          {
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
      retType: "system.bool",
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
        for (let i = 1; i < paths.length; i++)
        {
          if (!tarField) return null

          typeInfo = await queryDataTypeInfo(tarField.type)
          if (typeInfo?.type === SchemaType.Array && typeInfo.array?.base)
          {
            typeInfo = await queryDataTypeInfo(typeInfo.array!.base)
          }

          if (typeInfo?.type === SchemaType.Struct && typeInfo.struct?.fields)
          {
            tarField = typeInfo.struct.fields.find(p => p.name === paths[i])
          }
          else
          {
            tarField = undefined
          }
        }
        return tarField?.type
      }
    }
  },
  {
    name : "system.structfieldselfrelationinfo",
    type : SchemaType.Struct,
    desc : "字段数据关联",
    struct : {
      fields : [
        {
          name : "relationType",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.relationtype",
          display : "函数结果用途"
        },
        {
          name : "func",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.functype",
          display : "关系函数",
        },
        {
          name : "funcArgs",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.structfieldfuncarguments",
          display : "函数参数",
        },
      ]
    }
  },
  {
    name : "system.structfieldselfrelationinfos",
    type : SchemaType.Array,
    desc : "字段数据关联列表",
    array : {
      base : "system.structfieldselfrelationinfo",
      primary : [ "relationType" ],
      valid : ""
    },
  },
  {
    name : "system.structfieldrelationinfo",
    type : SchemaType.Struct,
    desc : "字段数据关联",
    struct : {
      fields : [
        {
          name : "field",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.reltarfield",
          display : "目标字段",
        },
        {
          name: "fieldType",
          require : false,
          immutable : false,
          displayOnly: true,
          type : NS_SYSTEM_STRING,
          display : "字段类型",
        },
        {
          name : "relationType",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.relationtype",
          display : "函数结果用途",
        },
        {
          name : "func",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.functype",
          display : "关系函数",
        },
        {
          name : "funcArgs",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.structfieldfuncarguments",
          display : "函数参数",
        },
      ]
    }
  },
  {
    name : "system.structfieldrelationinfos",
    type : SchemaType.Array,
    desc : "字段数据关联列表",
    array : {
      base : "system.structfieldrelationinfo",
      primary : [ "field", "relationType" ],
      valid : ""
    },
  },
  {
    name : "system.structdefinition",
    type : SchemaType.Struct,
    desc : "结构体类型定义",
    struct : {
      fields : [
        {
          name : "base",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "schema.structtype",
          display : "基础结构体类型",
        },
        {
          name : "fields",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "system.structfieldtypes",
          display : "结构体类型字段列表",
          upLimit : 128,
        },
        {
          name : "indexes",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.datatableindexs",
          display : "索引列表",
        },
        {
          name : "relations",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.structfieldrelationinfos",
          display : "字段间关系申明",
        },
        {
          name: "valid",
          require: false,
          immutable: false,
          displayOnly: false,
          enumRoot: "system.bool",
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
      retType: "system.strings",
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

        for (let i = 0; i < fields.length; i++)
        {
          const type = fields[i].type
          if (await isIndexType(type, fields[i].upLimit ? parseInt(fields[i].upLimit) : undefined))
          {
            indexes.push(fields[i].name)
          }
        }

        return indexes
      }
    }
  },
  {
    name : "system.arraydefinition",
    type : SchemaType.Struct,
    desc : "数组类型定义",
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
          type: "system.strings",
          display: "作为主键的字段列表",
        },
        {
          name: "indexes",
          require: false,
          immutable: false,
          displayOnly: false,
          type: "system.datatableindexs",
          display: "索引列表",
        },
        {
          name: "valid",
          require: false,
          immutable: false,
          displayOnly: false,
          enumRoot: "system.bool",
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
          name : "relations",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.structfieldrelationinfos",
          display : "字段间关系申明",
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
    name: "system.anyvalue",
    type: SchemaType.Scalar,
    desc: "任意数据",
    scalar: {
    }
  },
  {
    name : "system.funcargument",
    type : SchemaType.Struct,
    desc : "函数参数配置",
    struct : {
      fields : [
        {
          name : "name",
          require : true,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "名称",
          upLimit : 32,
        },
        {
          name : "type",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.valuetype",
          display : "类型",
        },
        {
          name : "nullable",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.bool",
          display : "允许为空",
        },
        {
          name: "desc",
          require: false,
          immutable: false,
          displayOnly: false,
          type: NS_SYSTEM_STRING,
          display : "描述",
        },
      ]
    }
  },
  {
    name : "system.funcarguments",
    type : SchemaType.Array,
    desc : "函数参数配置列表",
    array : {
      base : "system.funcargument",
      primary : [],
      valid : ""
    },
  },
  {
    name : "system.funccallargument",
    type : SchemaType.Struct,
    desc : "函数调用参数",
    struct : {
      fields : [
        {
          name : "name",
          require : false,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "表达式",
          upLimit : 32,
        },
        {
          name : "value",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.anyvalue",
          display : "常量",
        },
      ]
    }
  },
  {
    name : "system.funccallarguments",
    type : SchemaType.Array,
    desc : "函数调用参数列表",
    array : {
      base : "system.funccallargument",
      primary : [],
      valid : ""
    },
  },
  {
    name : "system.funcexpression",
    type : SchemaType.Struct,
    desc : "函数表达式配置",
    struct : {
      fields : [
        {
          name : "name",
          require : true,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "表达式名称",
          upLimit : 32,
        },
        {
          name : "callType",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.exptype",
          default : ""+ExpressionType.Call,
          display : "调用方式",
        },
        {
          name : "callFunc",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.functype",
          display : "调用函数",
        },
        {
          name: "type",
          require: false,
          displayOnly: false,
          type: "schema.valuetype",
          display: "返回类型",
        },
        {
          name : "args",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "system.funccallarguments",
          display : "调用参数列表",
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
    name : "system.funcexpressions",
    type : SchemaType.Array,
    desc : "函数表达式列表",
    array : {
      base : "system.funcexpression",
      primary : [ "name" ],
      valid : ""
    },
  },
  {
    name : "system.funcdefinition",
    type : SchemaType.Struct,
    desc : "函数类型定义",
    struct : {
      fields : [
        {
          name : "retType",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "schema.valuetype",
          display : "返回值类型",
          upLimit : 128,
        },
        {
          name : "args",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "system.funcarguments",
          display : "函数参数列表",
        },
        {
          name : "exps",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "system.funcexpressions",
          display : "函数表达式列表",
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
      retType: "system.strings",
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
      func: (args: any[], exps: any[]) =>
      {
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
    name : "system.namespacedefinition",
    type : SchemaType.Struct,
    desc : "命名空间定义",
    struct : {
      fields : [
        {
          name : "name",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.namespaceinput",
          display : "名称",
          upLimit : 128,
        },
        {
          name : "type",
          require : true,
          immutable : false,
          displayOnly : false,
          type : "schema.schematype",
          display: "类型",
          default: ""+ SchemaType.Namspace,
        },
        {
          name : "desc",
          require : true,
          immutable : false,
          displayOnly : false,
          type : NS_SYSTEM_STRING,
          display : "描述",
          upLimit : 128,
        },
        {
          name : "scalar",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "schema.scalardefine",
          display : "基础数据类型定义",
        },
        {
          name : "enum",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "schema.enumdefine",",
          display : "枚举类型定义",
        },
        {
          name : "struct",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.structdefinition",
          display : "结构体类型定义",
        },
        {
          name : "array",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.arraydefinition",
          display : "数组类型定义",
        },
        {
          name : "function",
          require : false,
          immutable : false,
          displayOnly : false,
          type : "system.funcdefinition",
          display : "函数定义",
        },
      ],
      relations: [
        {
          field : "scalar",
          relationType : RelationType.Invisible,
          func : "system.logic.notequal",
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
          field : "enum",
          relationType : RelationType.Invisible,
          func : "system.logic.notequal",
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
          field : "struct",
          relationType : RelationType.Invisible,
          func : "system.logic.notequal",
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
          field : "array",
          relationType : RelationType.Invisible,
          func : "system.logic.notequal",
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
          field : "function",
          relationType : RelationType.Invisible,
          func : "system.logic.notequal",
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