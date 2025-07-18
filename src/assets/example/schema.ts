import {_LS, importLanguage, registerSchema, SchemaLoadState, type IStructScalarFieldConfig } from "schema-node"

registerSchema([
  {
    "name": "test",
    "type": "namespace",
    "desc": _LS("test"),
    "schemas": [
      {
        "name": "test.nosubjects",
        "type": "func",
        "desc": _LS("test.nosubjects"),
        "func": {
          "return": "system.bool",
          "args": [
            {
              "name": "subjects",
              "type": "test.subjects",
              "nullable": true
            }
          ],
          "exps": [
            {
              "name": "isnull",
              "return": "system.bool",
              "type": "call",
              "func": "system.logic.isnull",
              "args": [
                {
                  "name": "subjects"
                }
              ]
            },
            {
              "name": "len",
              "return": "system.int",
              "type": "call",
              "func": "system.collection.arrlen",
              "args": [
                {
                  "name": "subjects",
                  "value": "[]"
                }
              ]
            },
            {
              "name": "zerolen",
              "return": "system.bool",
              "type": "call",
              "func": "system.logic.equal",
              "args": [
                {
                  "name": "len"
                },
                {
                  "value": "0"
                }
              ]
            },
            {
              "name": "result",
              "return": "system.bool",
              "type": "call",
              "func": "system.logic.orelse",
              "args": [
                {
                  "name": "isnull"
                },
                {
                  "name": "zerolen"
                }
              ]
            }
          ]
        }
      },
      {
        "name": "test.person",
        "type": "struct",
        "desc": _LS("test.person"),
        "struct": {
          "fields": [
            {
              "name": "name",
              "type": "system.string",
              "display": _LS("test.person.name"),
              "upLimit": "24",
              "require": true
            } as IStructScalarFieldConfig,
            {
              "name": "subjects",
              "type": "test.subjects",
              "display": _LS("test.person.subjects"),
              "require": true
            },
            {
              "name": "scores",
              "type": "test.subjectscores",
              "display": _LS("test.person.scores"),
            },
            {
              "name": "avg",
              "type": "system.number",
              "display": _LS("test.person.avg"),
              "displayOnly": true
            }
          ],
          "relations": [
            {
              "field": "scores",
              "type": "invisible",
              "func": "test.nosubjects",
              "args": [
                {
                  "name": "subjects"
                }
              ]
            },
            {
              "field": "scores.subject",
              "type": "whiteList",
              "func": "system.conv.assign",
              "args": [
                {
                  "name": "subjects"
                }
              ]
            },
            {
              "field": "scores.subject",
              "type": "blackList",
              "func": "system.collection.getfields",
              "args": [
                {
                  "name": "scores",
                  "value": "[]"
                },
                {
                  "value": "subject"
                }
              ]
            },
            {
              "field": "avg",
              "type": "default",
              "func": "system.collection.averagefields",
              "args": [
                {
                  "name": "scores"
                },
                {
                  "value": "score"
                }
              ]
            }
          ]
        }
      },
      {
        "name": "test.persons",
        "type": "array",
        "desc": _LS("test.persons"),
        "array": {
          element: "test.person",
          primary: ["name"]
        }
      },
      {
        "name": "test.subject",
        "type": "enum",
        "desc": _LS("test.subject"),
        "enum": {
          "type": "int",
          "cascade": [
            "category",
            "subject"
          ],
          "values": [
            {
              "value": 100,
              "name": "Language",
              "disable": false,
              "subList": [
                {
                  "value": 101,
                  "name": "English",
                  "disable": false
                },
                {
                  "value": 102,
                  "name": "Grammar and Vocabulary",
                  "disable": false
                },
                {
                  "value": 103,
                  "name": "Speech",
                  "disable": false
                },
                {
                  "value": 104,
                  "name": "Creative Writing",
                  "disable": false
                }
              ]
            },
            {
              "value": 200,
              "name": "Mathematics",
              "disable": false,
              "subList": [
                {
                  "value": 201,
                  "name": "Algebra I & II",
                  "disable": false
                },
                {
                  "value": 202,
                  "name": "Geometry",
                  "disable": false
                },
                {
                  "value": 203,
                  "name": "Trigonometry",
                  "disable": false
                },
                {
                  "value": 204,
                  "name": "Calculus",
                  "disable": false
                },
                {
                  "value": 205,
                  "name": "Statistics",
                  "disable": false
                }
              ]
            },
            {
              "value": 300,
              "name": "Science",
              "disable": false,
              "subList": [
                {
                  "value": 301,
                  "name": "Biology",
                  "disable": false
                },
                {
                  "value": 302,
                  "name": "Chemistry",
                  "disable": false
                },
                {
                  "value": 303,
                  "name": "Physics",
                  "disable": false
                },
                {
                  "value": 304,
                  "name": "Earth Science",
                  "disable": false
                },
                {
                  "value": 305,
                  "name": "Environmental Science",
                  "disable": false
                }
              ]
            }
          ]
        }
      },
      {
        "name": "test.subjects",
        "type": "array",
        "desc": _LS("test.subjects"),
        "array": {
          "element": "test.subject"
        }
      },
      {
        "name": "test.subjectscore",
        "type": "struct",
        "desc": _LS("test.subjectscore"),
        "struct": {
          "fields": [
            {
              "name": "subject",
              "type": "test.subject",
              "display": _LS("test.subjectscore.subject"),
              "require": true
            },
            {
              "name": "score",
              "type": "system.int",
              "display": _LS("test.subjectscore.score"),
              "require": true,
              "lowLimit": "0",
              "upLimit": "100"
            } as IStructScalarFieldConfig
          ]
        }
      },
      {
        "name": "test.subjectscores",
        "type": "array",
        "desc": _LS("test.subjectscores"),
        "array": {
          "element": "test.subjectscore",
          "primary": [
            "subject"
          ]
        }
      }
    ]
  }
], SchemaLoadState.Custom)

importLanguage("enUS", {
  "test": "A test namespace",
  "test.nosubjects": "No subject choosed",
  "test.person": "A person info",
  "test.persons": "Person List",
  "test.subject": "Subject",
  "test.subjects": "Subjects",
  "test.subjectscore": "Subect score",
  "test.subjectscores": "Subject score list",
  "test.person.name": "Name",
  "test.person.subjects": "Subjects",
  "test.person.scores": "Scores",
  "test.person.avg": "Average",
  "test.subjectscore.subject": "Subject",
  "test.subjectscore.score": "Score",
})

importLanguage("zhCN", {
  "test": "测试用",
  "test.nosubjects": "未选中学科",
  "test.person": "学生成绩信息",
  "test.persons": "学生列表",
  "test.subject": "学科",
  "test.subjects": "学科列表",
  "test.subjectscore": "学科成绩",
  "test.subjectscores": "学科成绩列表",
  "test.person.name": "名字",
  "test.person.subjects": "学科列表",
  "test.person.scores": "成绩列表",
  "test.person.avg": "平均成绩",
  "test.subjectscore.subject": "学科",
  "test.subjectscore.score": "成绩",
})