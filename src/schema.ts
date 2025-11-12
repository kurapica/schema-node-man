import { _L, _LS, ARRAY_ELEMENT, ARRAY_ITSELF, deepClone, EnumValueType, ExpressionType, getArraySchema, getCachedSchema, getSchema, isNull, isSchemaCanBeUseAs, isStructFieldIndexable, newSystemArray, newSystemFunc, newSystemRelArray, newSystemScalar, newSystemStruct, NS_SYSTEM_ARRAY, NS_SYSTEM_BOOL, NS_SYSTEM_INT, NS_SYSTEM_INTS, NS_SYSTEM_LOCALE_STRING, NS_SYSTEM_LOCALE_STRINGS, NS_SYSTEM_NUMBER, NS_SYSTEM_STRING, NS_SYSTEM_STRINGS, registerSchema, RelationType, SchemaLoadState, SchemaType, type ILocaleString, type INodeSchema, type IStructFieldConfig } from "schema-node"

// Schema for definition
registerSchema([
    //#region system scalars
    newSystemScalar("system.schema.pushfunctype", "system.schema.functype"),
    newSystemScalar("system.schema.namespaceinput", NS_SYSTEM_STRING, undefined, "^[a-z]\\w*(\.[a-z]\\w*)*$", { upLimit: 128 }),
    newSystemScalar("system.schema.reltarfield", NS_SYSTEM_STRING, undefined, undefined, { upLimit: 64 }),
    //#endregion

    //#region scalar definition
    newSystemStruct("system.schema.scalarschema", [
        { name: "base", type: "system.schema.scalartype", require: true },
        { name: "unit", type: NS_SYSTEM_LOCALE_STRING },
        { name: "lowLimit", type: NS_SYSTEM_NUMBER },
        { name: "upLimit", type: NS_SYSTEM_NUMBER },
        { name: "error", type: NS_SYSTEM_LOCALE_STRING },
        { name: "regex", type: NS_SYSTEM_STRING },
        { name: "whiteList", type: "system.schema.whitelistfunc" },
        { name: "asSuggest", type: NS_SYSTEM_BOOL },
        { name: "preValid", type: "system.schema.validfunc" },
        { name: "postValid", type: "system.schema.validfunc" },
    ], [
        { field: "whiteList", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "base" } ] },
        { field: "preValid", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "base" } ] },
        { field: "postValid", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "base" } ] }
    ]),
    //#endregion

    //#region enum definition
    newSystemFunc("system.schema.calcnextflag", NS_SYSTEM_INT, [
        { name: "values", type: NS_SYSTEM_INTS }
    ], (values: any[]) => {
        if (!Array.isArray(values) || values.length == 0) return 0
        const last = values[values.length - 1]
        return !last?.value ? 1 : last.value * 2
    }),

    newSystemStruct("system.schema.enumvalueinfo", [
        { name: "value", type: NS_SYSTEM_STRING, require: true, immutable: true },
        { name: "name", type: NS_SYSTEM_LOCALE_STRING, require: true },
        { name: "disable", type: NS_SYSTEM_BOOL, default: false }
    ]),
    newSystemArray("system.schema.enumvalueinfos", "system.schema.enumvalueinfo", "value"),

    newSystemStruct("system.schema.enumintvalueinfo", [
        { name: "value", type: NS_SYSTEM_INT, require: true, immutable: true },
        { name: "name", type: NS_SYSTEM_LOCALE_STRING, require: true },
        { name: "disable", type: NS_SYSTEM_BOOL, default: false }
    ]),
    newSystemArray("system.schema.enumintvalueinfos", "system.schema.enumintvalueinfo", "value"),
    
    newSystemStruct("system.schema.enumflagvalueinfo", [
        { name: "value", type: NS_SYSTEM_INT, require: true, immutable: true },
        { name: "name", type: NS_SYSTEM_LOCALE_STRING, require: true },
        { name: "disable", type: NS_SYSTEM_BOOL, default: false }
    ]),
    newSystemRelArray("system.schema.enumflagsvalueinfos", "system.schema.enumflagvalueinfo", [
        { field: "value", type: RelationType.Assign, func: "system.schema.calcnextflag", args: [ { name: ARRAY_ITSELF} ] }
    ], "value"),
    
    newSystemFunc("system.schema.getenuminfostype", "system.schema.arraytype", [
        { name: "type", type: "system.schema.enumvaluetype" }
    ], (type: EnumValueType) => {
        switch (type)
        {
            case EnumValueType.String: return "system.schema.enumvalueinfos"
            case EnumValueType.Int: return "system.schema.enumintvalueinfos"
            case EnumValueType.Flags: return "system.schema.enumflagsvalueinfos"
        }
    }),

    newSystemStruct("system.schema.enumschema", [
        { name: "type", type: "system.schema.enumvaluetype", require: true, default: EnumValueType.Int },
        { name: "cascade", type: NS_SYSTEM_LOCALE_STRINGS },
        { name: "values", type: "system.schema.enumvalueinfos" },
    ], [
        { field: "cascade", type: RelationType.Invisible, func: "system.logic.equal", args: [ { name: "type" }, { value: EnumValueType.Flags }] },
        { field: "values", type: RelationType.Type, func: "system.schema.getenuminfostype", args: [ { name: "type" }] }
    ]),
    //#endregion

    //#region struct definition
    newSystemFunc("system.schema.getexpvaluetype", "system.schema.valuetype", [
        { name: "type", type: "system.schema.valuetype" }
    ], async(type: string) => {
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array) schema = schema.array?.element ? await getSchema(schema.array.element) : undefined
        if (schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum) return type
        return NS_SYSTEM_STRING
    }),

    newSystemFunc("system.schema.hideexpvalue", "system.schema.valuetype", [
        { name: "type", type: "system.schema.valuetype" },
        { name: "name", type: NS_SYSTEM_STRING }
    ], async(type: string, name: string) => {
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array) schema = schema.array?.element ? await getSchema(schema.array.element) : undefined
        if (schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum) return !isNull(name)
        return true
    }),
    
    newSystemStruct("system.schema.structfldfuncarg", [
        { name: "label", type: NS_SYSTEM_STRING, displayOnly: true },
        { name: "type", type: "system.schema.valuetype", displayOnly: true },
        { name: "name", type: "system.schema.reltarfield" },
        { name: "value", type: "system.schema.anyvalue" },
    ], [
        { field: "name", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "type" } ]},
        { field: "name", type: RelationType.Disable, func: "system.logic.notempty", args: [ { name: "value" } ]},
        { field: "value", type: RelationType.Type, func: "system.schema.getexpvaluetype", args: [ { name: "type" } ]},
        { field: "value", type: RelationType.Disable, func: "system.schema.hideexpvalue", args: [ { name: "type" }, { name: "name" } ]},
    ]),
    newSystemArray("system.schema.structfldfuncargs", "system.schema.structfldfuncarg"),
    
    newSystemFunc("system.schema.isscalartype", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        const schema = await getSchema(type)
        return schema?.type === SchemaType.Scalar
    }),
    
    newSystemFunc("system.schema.isscalarenumtype", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.valuetype", nullable: true }
    ], async (type: string) => {
        let schema = type ? await getSchema(type) : null
        if (schema?.type === SchemaType.Array && schema.array?.element) schema = await getSchema(schema.array.element)
        return schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum
    }),

    newSystemFunc("system.schema.iscascadeenumtype", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array && schema.array?.element) schema = await getSchema(schema.array.element)
        return schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1
    }),
    
    newSystemFunc("system.schema.getroottype", "system.schema.valuetype", [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array && schema.array?.element) schema = await getSchema(schema.array.element)
        return schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum ? schema?.name : NS_SYSTEM_STRING
    }),

    newSystemFunc("system.schema.isflagsenumtype", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        const schema = await getSchema(type)
        return schema?.type === SchemaType.Enum && schema.enum?.type === EnumValueType.Flags
    }),

    newSystemFunc("system.schema.getenumcascadewhitelist", NS_SYSTEM_ARRAY, [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array && schema.array?.element) schema = await getSchema(schema.array.element)
        if (schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1) {
            return schema.enum.cascade.map((item: ILocaleString, i: number) => ({
                value: i + 1,
                label: _L(item)
            }))
        }
        return null
    }),

    newSystemFunc("system.schema.isenumroot", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.valuetype" },
        { name: "cascade", type: NS_SYSTEM_INT, nullable: true }
    ], async (type: string, cascade?: number) => {
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array && schema.array?.element) schema = await getSchema(schema.array.element)
        if (schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1) {
            return cascade != 1
        }
        return false
    }),

    newSystemFunc("system.schema.getenumrootcascade", NS_SYSTEM_INT, [
        { name: "type", type: "system.schema.valuetype" },
        { name: "cascade", type: NS_SYSTEM_INT, nullable: true }
    ], async (type: string, cascade?: number) => {
        if (cascade) return cascade - 1        
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array && schema.array?.element) schema = await getSchema(schema.array.element)
        if (schema?.type === SchemaType.Enum && schema.enum?.cascade && schema.enum.cascade.length > 1) return schema.enum.cascade.length - 1
        return 0
    }),

    newSystemFunc("system.schema.getwhiteblacklisttype", "system.schema.valuetype", [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        const schema = await getSchema(type)
        if (schema?.type === SchemaType.Array || schema?.type === SchemaType.Struct) return NS_SYSTEM_STRING        
        const arraySchema = await getArraySchema(type)
        return arraySchema?.name
    }),
    
    newSystemFunc("system.schema.getscalarorenumtype", "system.schema.valuetype", [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        const schema = await getSchema(type)
        return schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum ? type : NS_SYSTEM_STRING
    }),

    newSystemStruct("system.schema.structfieldconfig", [
        { name: "name", type: "system.schema.varname", require: true, upLimit: 32 },
        { name: "type", type: "system.schema.valuetype", require: true },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "error", type: NS_SYSTEM_LOCALE_STRING },
        { name: "require", type: NS_SYSTEM_BOOL },
        { name: "immutable", type: NS_SYSTEM_BOOL },
        { name: "readonly", type: NS_SYSTEM_BOOL },
        { name: "invisible", type: NS_SYSTEM_BOOL },
        { name: "displayOnly", type: NS_SYSTEM_BOOL },
        { name: "unit", type: NS_SYSTEM_LOCALE_STRING },
        { name: "default", type: NS_SYSTEM_STRING, asSuggest: true },

        // scalar config
        { name: "whiteList", type: NS_SYSTEM_STRINGS, anyLevel: true },
        { name: "blackList", type: NS_SYSTEM_STRINGS, anyLevel: true },
        { name: "lowLimit", type: NS_SYSTEM_STRING },
        { name: "upLimit", type: NS_SYSTEM_STRING },
        { name: "asSuggest", type: NS_SYSTEM_BOOL },
        { name: "useOriginForUpLimit", type: NS_SYSTEM_BOOL },

        // enum config
        { name: "cascade", type: NS_SYSTEM_INT },
        { name: "root", type: NS_SYSTEM_STRING, anyLevel: true },
        { name: "anyLevel", type: NS_SYSTEM_BOOL },
        { name: "singleFlag", type: NS_SYSTEM_BOOL },
    ], [
        // default
        { field: "default", type: RelationType.Visible, func: "system.schema.isscalarenumtype", args: [ { name: "type" } ] },
        { field: "default", type: RelationType.Type, func: "system.schema.getscalarorenumtype", args: [ { name: "type" } ] },
        { field: "default", type: RelationType.WhiteList, func: "system.conv.assign", args: [ { name: "whiteList" } ] },
        { field: "default", type: RelationType.BlackList, func: "system.conv.assign", args: [ { name: "blackList" } ] },
        { field: "default", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "root" } ] },
        { field: "default", type: RelationType.AnyLevel, func: "system.conv.assign", args: [ { name: "anyLevel" } ] },
        { field: "default", type: RelationType.Cascade, func: "system.conv.assign", args: [ { name: "cascade" } ] },
        { field: "default", type: RelationType.SingleFlag, func: "system.conv.assign", args: [ { name: "singleFlag" } ] },

        // white list
        { field: "whiteList", type: RelationType.Visible, func: "system.schema.isscalarenumtype", args: [ { name: "type" } ] },
        { field: "whiteList", type: RelationType.Type, func: "system.schema.getwhiteblacklisttype", args: [ { name: "type" } ] },
        { field: "whiteList", type: RelationType.BlackList, func: "system.conv.assign", args: [ { name: "blackList" } ] },
        { field: "whiteList", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "root" } ] },
        { field: "whiteList", type: RelationType.Cascade, func: "system.conv.assign", args: [ { name: "cascade" } ] },
        { field: "blackList", type: RelationType.Visible, func: "system.schema.isscalarenumtype", args: [ { name: "type" } ] },
        { field: "blackList", type: RelationType.Type, func: "system.schema.getwhiteblacklisttype", args: [ { name: "type" } ] },
        { field: "blackList", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "root" } ] },
        { field: "blackList", type: RelationType.Cascade, func: "system.conv.assign", args: [ { name: "cascade" } ] },
        { field: "lowLimit", type: RelationType.Visible, func: "system.schema.isscalartype", args: [ { name: "type" } ] },
        { field: "upLimit", type: RelationType.Visible, func: "system.schema.isscalartype", args: [ { name: "type" } ] },
        { field: "asSuggest", type: RelationType.Visible, func: "system.schema.isscalartype", args: [ { name: "type" } ] },
        { field: "useOriginForUpLimit", type: RelationType.Visible, func: "system.schema.isscalartype", args: [ { name: "type" } ] },
        { field: "cascade", type: RelationType.Visible, func: "system.schema.iscascadeenumtype", args: [ { name: "type" } ] },
        { field: "cascade", type: RelationType.WhiteList, func: "system.schema.getenumcascadewhitelist", args: [ { name: "type" } ] },
        { field: "root", type: RelationType.Visible, func: "system.schema.isenumroot", args: [ { name: "type", }, { name: "cascade" } ] },
        { field: "root", type: RelationType.Type, func: "system.schema.getroottype", args: [ { name: "type" } ] },
        { field: "root", type: RelationType.Cascade, func: "system.schema.getenumrootcascade", args: [ { name: "type", }, {     name: "cascade" } ] },
        { field: "anyLevel", type: RelationType.Visible, func: "system.schema.iscascadeenumtype", args: [ { name: "type" } ] },
        { field: "singleFlag", type: RelationType.Visible, func: "system.schema.isflagsenumtype", args: [ { name: "type" } ] }
    ]),
    newSystemArray("system.schema.structfieldconfigs", "system.schema.structfieldconfig", "name"),

    newSystemFunc("system.schema.getstructindexfields", NS_SYSTEM_STRINGS, [ 
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
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
    }),
    
    newSystemFunc("system.schema.getstructnumbervaluefields", NS_SYSTEM_STRINGS, [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
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
    }),

    newSystemFunc("system.schema.getrelationfuncreturn", "system.schema.valuetype", [
        { name: "fieldType", type: "system.schema.valuetype" },
        { name: "relationType", type: "system.schema.relationtype" }
    ], async (fieldType: string, type: any) => {
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
    }),

    newSystemFunc("system.schema.getrelationwhitelist", NS_SYSTEM_STRINGS, [
        { name: "fieldType", type: NS_SYSTEM_STRING }
    ], async (fieldType: string) => {
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
    }),

    newSystemFunc("system.schema.getstructfieldtype", "system.schema.valuetype", [
        { name: "field", type: NS_SYSTEM_STRING},
        { name: "fields", type: "system.schema.structfieldconfigs"}
    ], async (field: string, fields: any[]) => {
        const paths = (field || "").split(".")
        if (paths.length === 0) return null
        let tarField = (fields || []).find(p => p.name === paths[0])
        for (let i = 1; i < paths.length; i++) {
            if (!tarField) return null

            let schema = await getSchema(tarField.type)
            if (schema?.type === SchemaType.Array && schema.array?.element) {
                schema = await getSchema(schema.array!.element)
            }

            if (paths[i] === ARRAY_ELEMENT) return schema?.name 

            if (schema?.type === SchemaType.Struct && schema.struct?.fields) {
                tarField = schema.struct.fields.find((p: IStructFieldConfig) => p.name === paths[i])
            }
            else {
                tarField = null
            }
        }
        return tarField?.type
    }),

    newSystemFunc("system.schema.getstructfieldtypebytype", "system.schema.valuetype", [
        { name: "type", type: "system.schema.valuetype" },
        { name: "field", type: NS_SYSTEM_STRING },
    ], async (type: string, field: string) => {
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
    }),

    newSystemStruct("system.schema.structfieldrelation", [
        { name: "field", type: "system.schema.reltarfield", require: true },
        { name: "fieldType", type : "system.schema.valuetype", displayOnly: true, invisible: true },
        { name: "return", type: "system.schema.valuetype", displayOnly: true, invisible: true },
        { name: "type", type: "system.schema.relationtype", require: true },
        { name: "func", type: "system.schema.functype", require: true },
        { name: "args", type: "system.schema.structfldfuncargs" },
    ], [
        { field: "type", type: RelationType.WhiteList, func: "system.schema.getrelationwhitelist", args: [ { name: "fieldType" } ] },
        { field: "return", type: RelationType.Default, func: "system.schema.getrelationfuncreturn", args: [ { name: "fieldType" }, { name: "type" } ] },
        { field: "func", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "return" } ] }
    ]),
    newSystemArray("system.schema.structfieldrelations", "system.schema.structfieldrelation", "field", "type"),
    
    newSystemStruct("system.schema.structschema", [
        { name: "base", type: "system.schema.structtype" },
        { name: "fields", type: "system.schema.structfieldconfigs", require: true},
        { name: "relations", type: "system.schema.structfieldrelations" },
    ], [
        { field: "relations.fieldType", type: RelationType.Default, func: "system.schema.getstructfieldtype", args: [ { name: "relations.field" }, { name: "fields" } ] },
    ]),
    //#endregion

    //#region array definition
    newSystemFunc("system.schema.isstructtype", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.valuetype", nullable: true }
    ], async (type: string) => {
        if (!type) return true
        const schema = await getSchema(type)
        return schema?.type === SchemaType.Struct
    }),

    newSystemFunc("system.schema.notstructarraytype", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.valuetype", nullable: true }
    ], async (type: string) => {
        if (!type) return true
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array)
            schema = schema.array?.element ? await getSchema(schema.array.element) : undefined
        return schema?.type !== SchemaType.Struct
    }),

    newSystemStruct("system.schema.datacombine", [
        { name: "field", type: NS_SYSTEM_STRING },
        { name: "type", type: "system.schema.datacombinetype" }
    ]),
    newSystemArray("system.schema.datacombines", "system.schema.datacombine", "field"),

    newSystemStruct("system.schema.dataindex", [
        { name: "name", type: NS_SYSTEM_STRING, upLimit: 16 },
        { name: "fields", type: NS_SYSTEM_STRINGS }
    ], [
        { field: "fields.$ele", type: RelationType.BlackList, func: "system.conv.assign", args: [ { name: "fields" } ] },
    ]),
    newSystemArray("system.schema.dataindexes", "system.schema.dataindex", "name"),

    newSystemStruct("system.schema.arrayschema", [
        { name: "element", type: "system.schema.arrayeletype" },
        { name: "single", type: NS_SYSTEM_BOOL },
        { name: "primary", type: NS_SYSTEM_STRINGS },
        { name: "indexes", type: "system.schema.dataindexes" },
        { name: "combines", type: "system.schema.datacombines" },
        { name: "relations", type: "system.schema.structfieldrelations" },
    ], [
        { field: "primary", type: RelationType.Visible, func: "system.schema.isstructtype", args: [ { name: "element" } ] },
        { field: "primary.$ele", type: RelationType.WhiteList, func: "system.schema.getstructindexfields", args: [ { name: "element" } ] },
        { field: "primary.$ele", type: RelationType.BlackList, func: "system.conv.assign", args: [ { name: "primary" } ] },
        { field: "indexes", type: RelationType.Visible, func: "system.schema.isstructtype", args: [ { name: "element" } ] },
        { field: "indexes.fields.$ele", type: RelationType.WhiteList, func: "system.schema.getstructindexfields", args: [ { name: "element" } ] },
        { field: "combines", type: RelationType.Visible, func: "system.schema.isstructtype", args: [ { name: "element" } ] },
        { field: "combines.field", type: RelationType.WhiteList, func: "system.schema.getstructnumbervaluefields", args: [ { name: "element" } ] },
        { field: "relations.fieldType", type: RelationType.Default, func: "system.schema.getstructfieldtypebytype", args: [ { name: "element" }, { name: "relations.field" } ] },
    ]),
    //#endregion

    //#region function definition
    newSystemFunc("system.schema.gettypedisplayorname", NS_SYSTEM_STRING, [
        { name: "type", type: "system.schema.valuetype" }
    ], async (type: string) => {
        const schema = type ? await getSchema(type) : null
        if (!schema) return null
        return schema.display?.key ? _L(schema.display) : schema.name.split('.').pop()
    }),

    newSystemStruct("system.schema.funcarg", [
        { name: "name", require: true, type: NS_SYSTEM_STRING, upLimit: 32 },
        { name: "type", require: true, type: "system.schema.valuetype" },
        { name: "nullable", type: NS_SYSTEM_BOOL }
    ], [
        { field: "name", type: RelationType.Default, func: "system.schema.gettypedisplayorname", args: [ { name: "type" } ] }
    ]),
    newSystemArray("system.schema.funcargs", "system.schema.funcarg", "name"),
    
    newSystemStruct("system.schema.funccallarg", [
        { name: "display", type: NS_SYSTEM_STRING, displayOnly: true},
        { name: "type", type: "system.schema.valuetype", displayOnly: true, invisible: true},
        { name: "name", type: NS_SYSTEM_STRING, upLimit: 32},
        { name: "value", type: "system.schema.anyvalue"},
    ], [
        { field: "name", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "type" } ] },
        { field: "name", type: RelationType.Disable, func: "system.logic.notempty", args: [ { name: "value" } ] },
        { field: "value", type: RelationType.Type, func: "system.schema.getexpvaluetype", args: [ { name: "type" } ] },
        { field: "value", type: RelationType.Disable, func: "system.schema.hideexpvalue", args: [ { name: "type" }, { name: "name" } ] },
    ]),
    newSystemArray("system.schema.funccallargs", "system.schema.funccallarg"),
    
    newSystemFunc("system.schema.getcalltypewhitelist", NS_SYSTEM_ARRAY, [
        { name: "return", type: "system.schema.valuetype" },
    ], async (ret: string) => {
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
    }),

    newSystemFunc("system.schema.getfuncroot", "system.schema.valuetype", [
        { name: "return", type: "system.schema.valuetype" },
        { name: "type", type: "system.schema.expressiontype" }
    ], async(ret: string, type: ExpressionType) =>
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
    }),

    newSystemStruct("system.schema.funcexp", [
        { name: "name", type: NS_SYSTEM_STRING, require: true, upLimit: 32 },
        { name: "return", type: "system.schema.valuetype", require: true },
        { name: "type", type: "system.schema.expressiontype", require: true, default: ExpressionType.Call },
        { name: "func", type: "system.schema.functype", require: true },
        { name: "args", type: "system.schema.funccallargs", require: true }
    ], [
        { field: "type", type: RelationType.WhiteList, func: "system.schema.getcalltypewhitelist", args: [ { name: "return" } ] },
        { field: "func", type: RelationType.Root, func: "system.schema.getfuncroot", args: [ { name: "return" }, { name: "type" } ] }
    ]),
    newSystemArray("system.schema.funcexps", "system.schema.funcexp", "name"),
    
    newSystemStruct("system.schema.functionschema", [
        { name: "return", type: "system.schema.valuetype", require: true, immutable: true },
        { name: "args", type: "system.schema.funcargs", require: true },
        { name: "exps", type: "system.schema.funcexps", require: true },
        { name: "generic", type: NS_SYSTEM_STRINGS, invisible: true },
        { name: "server", type: NS_SYSTEM_BOOL },
        { name: "nocache", type: NS_SYSTEM_BOOL }
    ]),
    //#endregion

    //#region event definition
    newSystemStruct("system.schema.eventschema", [
        { name: "scope", type: "system.schema.eventscope", require: true, readonly: true },
        { name: "payload", type: "system.schema.valuetype", readonly: true }
    ]),
    //#endregion

    //#region workflow definition
    newSystemStruct("system.schema.workflowschema", [
        { name: "mode", type: "system.schema.workflowmode", require: true, readonly: true },
        { name: "payload", type: "system.schema.valuetype", readonly: true },
        { name: "state", type: "system.schema.valuetype", readonly: true },
        { name: "session", type: "system.schema.valuetype", readonly: true },
        { name: "args", type: "system.schema.funcargs", readonly: true }
    ]),
    //#endregion

    //#region namespace definition
    newSystemFunc("system.schema.genarraydisplay", NS_SYSTEM_STRING, [
        { name: "elementType", type: "system.schema.valuetype" }
    ], (elementType: string) => `{[LIST.PREFIX]}{@${elementType}}{[LIST.SUFFIX]}`),

    newSystemStruct("system.schema.nodeschema", [
        { name: "name", type: "system.schema.namespaceinput", require: true, immutable: true },
        { name: "type", type: "system.schema.schematype", require: true, immutable: true, default: SchemaType.Namespace, blackList: [SchemaType.Json] },
        { name: "display", type: "system.localestring", require: true, upLimit: 128 },
        { name: "scalar", type: "system.schema.scalarschema" },
        { name: "enum", type: "system.schema.enumschema" },
        { name: "struct", type: "system.schema.structschema" },
        { name: "array", type: "system.schema.arrayschema" },
        { name: "func", type: "system.schema.functionschema" },
        { name: "event", type: "system.schema.eventschema" },
        { name: "workflow", type: "system.schema.workflowschema" }
    ], [
        { field: "scalar", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "type" }, { value: SchemaType.Scalar } ] },
        { field: "enum", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "type" }, { value: SchemaType.Enum } ] },
        { field: "struct", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "type" }, { value: SchemaType.Struct } ] },
        { field: "array", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "type" }, { value: SchemaType.Array } ] },
        { field: "func", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "type" }, { value: SchemaType.Func } ] },
        { field: "event", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "type" }, { value: SchemaType.Event } ] },
        { field: "workflow", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "type" }, { value: SchemaType.Workflow } ] },
        { field: "display.key", type: RelationType.Default, func: "system.schema.genarraydisplay", args: [ { name: "array.element" } ] }
    ]),
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

regSchemaTypeView("system.schema.functionschema", funcdefineView)

//#endregion