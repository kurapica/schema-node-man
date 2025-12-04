import { _L, getAppSchema, getFieldAccessWhiteList, getSchema, isNull, NS_SYSTEM_CONTEXT, NS_SYSTEM_STRING, SchemaType, StructNode, type INodeSchema, type ScalarNode } from "schema-node"

export interface ArgInfo {
    type?: string,
    display?: string,
    whiteList?: any[],
}

const refreshFieldFunc = async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
    const expName = args[0].getField("name")!.rawData
    let exp = typeMap.get(expName)
    if (exp?.type === SchemaType.Array && exp.array?.element)
        exp = await getSchema(exp.array.element)
    if (exp && exp.type === SchemaType.Struct && exp.struct?.fields.length) {
        return [{}, { type: NS_SYSTEM_STRING, whiteList: await getFieldAccessWhiteList(ret || "", exp.struct.fields, undefined, true) }]
    }
    return []
}

const toEntryFunc = async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
    const expName = args[0].getField("name")!.rawData
    let exp = typeMap.get(expName)
    if (exp?.type === SchemaType.Array && exp.array?.element)
        exp = await getSchema(exp.array.element)
    if (exp && exp.type === SchemaType.Struct && exp.struct?.fields.length) {
        return [{}, 
            { type: NS_SYSTEM_STRING, whiteList: await getFieldAccessWhiteList(NS_SYSTEM_STRING, exp.struct.fields, undefined, true) },
            { type: NS_SYSTEM_STRING, whiteList: await getFieldAccessWhiteList(NS_SYSTEM_STRING, exp.struct.fields, undefined, true) }
        ]
    }
    return []
}

const refreshAppDataFetchFunc = async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
    const app = args[0].getField("value")!.rawData
    const appSchema = !isNull(app) ? await getAppSchema(app) : undefined
    const result: ArgInfo[] = [{}]

    if (!appSchema) return result
    result.push({ whiteList: await getFieldAccessWhiteList("", appSchema.fields || [], undefined, true) })

    const fname = args[1].getField("value")!.rawData
    const field = !isNull(fname) ? appSchema.fields?.find(f => f.name === fname) : undefined

    // field not selected
    if (!field) return result

    let fieldSchema = await getSchema(field.type)
    if (fieldSchema?.type === SchemaType.Array && fieldSchema.array?.element && fieldSchema.array?.primary?.length)
    {
        const primarys = fieldSchema.array.primary
        if (primarys.length !== args.length - 3)
        {
            func.data = primarys.length === 1
                ? "system.data.getappdatabyonekey"
                : primarys.length === 2
                    ? "system.data.getappdatabytwokey"
                    : primarys.length === 3
                        ? "system.data.getappdatabythreekey"
                        : "system.data.getappdatabyfourkey"
            return result
        }

        fieldSchema = await getSchema(fieldSchema.array.element)
        if (fieldSchema?.type === SchemaType.Struct && fieldSchema.struct?.fields.length)
        {
            for (let i = 0; i < primarys.length; i++)
            {
                const f = fieldSchema.struct!.fields.find(f => f.name === primarys[i])
                if (f) {
                    result.push({ type: f.type, display: _L(f.display || f.name) })
                }
                else {
                    result.push({})
                }
            }
        }
    }
    else if(args.length > 3)
    {
        // change the func to match the field
        func.data = "system.data.getappdata"
    }
    return result
}

const refreshAppFieldDataFetchFunc = async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
    const app = args[0].getField("value")!.rawData
    const appSchema = !isNull(app) ? await getAppSchema(app) : undefined
    const result: ArgInfo[] = [{}]

    if (!appSchema) return result
    result.push({ whiteList: await getFieldAccessWhiteList("", appSchema.fields || [], undefined, true) })

    const fname = args[1].getField("value")!.rawData
    const field = !isNull(fname) ? appSchema.fields?.find(f => f.name === fname) : undefined

    // field not selected
    if (!field) return result
    let fieldSchema = await getSchema(field.type)

    const primarys = fieldSchema?.type === SchemaType.Array && fieldSchema.array?.element && fieldSchema.array?.primary || []
    if (fieldSchema?.type === SchemaType.Array)
        fieldSchema = fieldSchema.array?.element ? await getSchema(fieldSchema.array.element) : undefined

    // no data field can be fetched
    if (fieldSchema?.type !== SchemaType.Struct)
    {
        func.data = "system.data.getappdata"
        return result
    }

    // data field
    result.push({ whiteList: await getFieldAccessWhiteList("", fieldSchema.struct?.fields.filter(f => !primarys.includes(f.name)) || [], undefined, true) })

    // primary key check
    if (primarys.length)
    {
        if (primarys.length !== args.length - 4)
        {
            func.data = primarys.length === 1
                ? "system.data.getappfdatabyonekey"
                : primarys.length === 2
                    ? "system.data.getappfdatabytwokey"
                    : primarys.length === 3
                        ? "system.data.getappfdatabythreekey"
                        : "system.data.getappfdatabyfourkey"
            return result
        }

        for (let i = 0; i < primarys.length; i++)
        {
            const f = fieldSchema.struct!.fields.find(f => f.name === primarys[i])
            if (f) {
                result.push({ type: f.type, display: _L(f.display || f.name)  })
            }
            else {
                result.push({})
            }
        }
    }
    else if(args.length > 3)
    {
        // change the func to match the field
        func.data = "system.data.getappfdata"
    }
    return result
}

export const specialFuncRefresh: { [key: string]: (func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => Promise<ArgInfo[]> } = {
    // field access
    "system.collection.delfield": refreshFieldFunc,
    "system.collection.getfield": refreshFieldFunc,
    "system.collection.getfields":refreshFieldFunc,
    "system.collection.setfield": refreshFieldFunc,

    // field equal
    "system.collection.fieldequal":async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
        const expName = args[0].getField("name")!.rawData
        let exp = typeMap.get(expName)
        if (exp?.type === SchemaType.Array && exp.array?.element)
            exp = await getSchema(exp.array.element)
        if (exp && exp.type === SchemaType.Struct && exp.struct?.fields.length) {
            const result:any = [{}, { type: NS_SYSTEM_STRING, whiteList: await getFieldAccessWhiteList("", exp.struct.fields, undefined, true) }]
            const fldName = args[1].getField("value")!.rawData
            const field = !isNull(fldName) ? exp.struct.fields.find(f => f.name === fldName) : undefined
            if (field) {
                result.push({ type: field.type })
            }
            return result
        }
        return []
    },

    // to entry
    "system.str.toentry": toEntryFunc,
    "system.str.toentrys": toEntryFunc,

    // fetch context item
    "system.data.getcontextitem": async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
        const contextSchema = await getSchema(NS_SYSTEM_CONTEXT)
        return [{ type: ret, whiteList: await getFieldAccessWhiteList(ret || "", contextSchema?.struct?.fields || [])}]
    },

    // app data fetch
    "system.data.getappdata": refreshAppDataFetchFunc,
    "system.data.getappdatabyonekey": refreshAppDataFetchFunc,
    "system.data.getappdatabytwokey": refreshAppDataFetchFunc,
    "system.data.getappdatabythreekey": refreshAppDataFetchFunc,
    "system.data.getappdatabyfourkey": refreshAppDataFetchFunc,

    // app field data fetch
    "system.data.getappfdata": refreshAppFieldDataFetchFunc,
    "system.data.getappfdatabyonekey": refreshAppFieldDataFetchFunc,
    "system.data.getappfdatabytwokey": refreshAppFieldDataFetchFunc,
    "system.data.getappfdatabythreekey": refreshAppFieldDataFetchFunc,
    "system.data.getappfdatabyfourkey": refreshAppFieldDataFetchFunc,
}
