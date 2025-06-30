import { EnumValueType, NS_SYSTEM_BOOL } from "schema-node"
import { ExpressionType, RelationType, NS_SYSTEM_INT, NS_SYSTEM_STRING, NS_SYSTEM_DATE, registerSchema, SchemaType, type IStructScalarFieldConfig } from "schema-node"

registerSchema([
    {
        name: "frontend",
        type: SchemaType.Namespace,
    },
    {
        name: "frontend.subject",
        type: SchemaType.Enum,
        enum: {
            type: EnumValueType.Int,
            values: [
                {
                    value: 1,
                    name: "语文"
                },
                {
                    value: 2,
                    name: "数学"
                },
                {
                    value: 3,
                    name: "物理"
                },
                {
                    value: 4,
                    name: "政治"
                },
                {
                    value: 5,
                    name: "化学"
                }
            ]
        }
    },
    {
        name: "frontend.gpa",
        type: SchemaType.Enum,
        enum: {
            type: EnumValueType.Int,
            values: [
                {
                    value: 5,
                    name: "优秀"
                },
                {
                    value: 4,
                    name: "良好"
                },
                {
                    value: 3,
                    name: "合格"
                },
                {
                    value: 2,
                    name: "及格"
                },
                {
                    value: 1,
                    name: "不及格"
                }
            ]
        }
    },
    {
        name: "frontend.subjects",
        type: SchemaType.Array,
        array: {
            element: "frontend.subject"
        }
    },
    {
        name: "frontend.calcage",
        type: SchemaType.Function,
        func: {
            args: [
                {
                    name: "born",
                    type: NS_SYSTEM_DATE
                }
            ],
            return: NS_SYSTEM_INT,
            exps: [
                {
                    name: "result",
                    type: ExpressionType.Call,
                    func: "system.datetime.getyears",
                    return: NS_SYSTEM_INT,
                    args: [
                        {
                            name: "born",
                        }
                    ]
                }
            ],
        }
    },
    {
        name: "frontend.score",
        type: SchemaType.Struct,
        struct: {
            fields: [
                {
                    name: "subject",
                    type: "frontend.subject",
                    display: "功课",
                } as IStructScalarFieldConfig,
                {
                    name: "score",
                    type: NS_SYSTEM_INT,
                    display: "成绩",
                    upLimit: 100,
                    lowLimit: 0,
                } as IStructScalarFieldConfig
            ]
        }
    },
    {
        name: "frontend.scores",
        type: SchemaType.Array,
        array: {
            element: "frontend.score",
            primary: ["subject"]
        }
    },
    {
        name: "frontend.person",
        type: SchemaType.Struct,
        struct: {
            fields: [
                {
                    name: "name",
                    type: NS_SYSTEM_STRING,
                    display: "名字",
                    immutable: true,
                    upLimit: 60,
                } as IStructScalarFieldConfig,
                {
                    name: "born",
                    type: NS_SYSTEM_DATE,
                    display: "生日",
                    lowLimit: "1980-01-01T00:00:00Z",
                    upLimit: "2024-12-31T23:59:59Z"
                } as IStructScalarFieldConfig,
                {
                    name: "subjects",
                    type: "frontend.subjects",
                    display: "功课列表",
                } as IStructScalarFieldConfig,
                {
                    name: "age",
                    type: NS_SYSTEM_INT,
                    display: "年龄",
                    displayOnly: true,
                } as IStructScalarFieldConfig,
                {
                    name: "gpa",
                    type: NS_SYSTEM_BOOL,
                    display: "使用绩点",
                    default: false
                },
                {
                    name: "scores",
                    type: "frontend.scores",
                    display: "成绩单",
                },
                {
                    name: "average",
                    type: "system.number",
                    display: "平均成绩",
                    displayOnly: true,
                }
            ],
            relations: [
                {
                    field: "age",
                    type: RelationType.Default,
                    func: "frontend.calcage",
                    args: [
                        {
                            name: "born"
                        }
                    ]
                },
                {
                    field: "scores.subject",
                    type: RelationType.WhiteList,
                    func: "system.conv.assign",
                    args: [
                        {
                            name: "subjects"
                        }
                    ]
                },
                {
                    field: "scores.subject",
                    type: RelationType.BlackList,
                    func: "system.collection.getfields",
                    args: [
                        {
                            name: "scores"
                        },
                        {
                            value: "subject"
                        }
                    ]
                },
                {
                    field: "scores.score",
                    type: RelationType.Type,
                    func: "system.logic.cond",
                    args: [
                        {
                            name: "gpa"
                        },
                        {
                            value: "frontend.gpa"
                        },
                        {
                            value: NS_SYSTEM_INT
                        }
                    ]
                },
                {
                    field: "average",
                    type: RelationType.Default,
                    func: "system.collection.averagefields",
                    args: [
                        {
                            name: "scores"
                        },
                        {
                            value: "score"
                        }
                    ]
                }
            ]
        }
    }
])