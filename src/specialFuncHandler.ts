import { _L, getAppSchema, getFieldAccessWhiteList, getSchema, isNull, NS_SYSTEM_CONTEXT, NS_SYSTEM_STRING, SchemaType, StructNode, type INodeSchema, type ScalarNode } from "schema-node"

export interface ArgInfo {
    type?: string,
    display?: string,
    whiteList?: any[],
    matchArray?: boolean
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

export const specialFuncRefresh: { [key: string]: (func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => Promise<ArgInfo[]> } = {
    // field access
    "system.collection.getfield": refreshFieldFunc,
    "system.collection.getfields":refreshFieldFunc,

    // to entry
    "system.str.map.toentry": toEntryFunc,
    "system.str.map.toentrys": toEntryFunc,

    // fetch context item
    "system.data.getcontext": async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
        const contextSchema = await getSchema(NS_SYSTEM_CONTEXT)
        return [{ type: ret, whiteList: await getFieldAccessWhiteList(ret || "", contextSchema?.struct?.fields || [])}]
    },

    // app data fetch
    "system.data.get": async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
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
        return result
    },

    // app field data fetch
    "system.data.getdatasource": async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
        const app = `${args[0].getField("value")!.rawData}`
        const appSchema = !isNull(app) ? await getAppSchema(app) : undefined
        const result: ArgInfo[] = [{}]

        if (!appSchema) return result
        result.push({ whiteList: await getFieldAccessWhiteList(ret || "", appSchema.fields || [], undefined, true) })

        return result
    },

    "system.data.getfield": async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
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
            func.data = "system.data.get"
            return result
        }

        // data field
        result.push({ whiteList: await getFieldAccessWhiteList("", fieldSchema.struct?.fields.filter(f => !primarys.includes(f.name)) || [], undefined, true) })

        // primary key check
        if (primarys.length)
        {
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
        return result
    },

    "system.data.save": async(func: ScalarNode, args: StructNode[], typeMap: Map<string, INodeSchema>, ret?: string) => {
        const app = `${args[0].getField("value")!.rawData}`
        const appSchema = !isNull(app) ? await getAppSchema(app) : undefined
        const result: ArgInfo[] = [{}]

        if (!appSchema) return result
        result.push({ whiteList: await getFieldAccessWhiteList(ret || "", appSchema.fields || [], undefined, true) })

        const field = `${args[1].getField("value")!.rawData}`
        const fieldSchema = appSchema.fields?.find(f => f.name === field)
        const fieldType = fieldSchema?.type ? await getSchema(fieldSchema.type) : undefined
        if (!fieldType || fieldType.type !== SchemaType.Array || !fieldType.array?.primary?.length) return result

        // value type
        const chooseValue = args[2].getField("name")!.rawData
        if (!isNull(chooseValue) && typeMap.has(chooseValue)) {
            result.push({ type: typeMap.get(chooseValue)!.name }) // value type
        }
        else
        {
            result.push({ type: fieldType.array.element, matchArray: true }) // value type
        }

        // pass onlyAdd and target and raiseEvent
        result.push({})
        result.push({})
        result.push({})

        // overrides
        const elementType = fieldType.array.element ? await getSchema(fieldType.array.element) : undefined
        if (!elementType || elementType.type !== SchemaType.Struct || !elementType.struct?.fields.length) return result
        let whiteList = await getFieldAccessWhiteList("", elementType.struct.fields.filter(f => !fieldType.array!.primary!.includes(f.name)), undefined, true)
        for (let i = 5; i < args.length; i++) {
            result.push({ whiteList: whiteList })

            // remove used field
            const fname = args[i].getField("value")!.rawData
            whiteList = whiteList.filter(w => w.value !== fname)
        }

        return result
    },
}
