import { type IStructFieldConfig, type IFunctionArgumentInfo, type IFunctionExpression, type IStructFieldRelation, type IFunctionCallArgument, type IAppFieldSchema, _LS, getAppCachedSchema, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, registerAppSchema, registerSchema, SchemaLoadState, SchemaType, type IAppSchema, RelationType, NS_SYSTEM_STRINGS, getAppSchema, getSchema, ARRAY_ELEMENT, deepClone, type INodeSchema, isNull, getCachedSchema, _L, newSystemArray, newSystemFunc, newSystemScalar, newSystemStruct, NS_SYSTEM_LOCALE_STRING, WorkflowMode, ARRAY_ITSELF } from "schema-node"

// Schema for definition
registerSchema([
    newSystemScalar("system.schema.appaccessfld", NS_SYSTEM_STRING),
    newSystemScalar("system.schema.apppushfld", "system.schema.appaccessfld"),
    newSystemArray ("system.schema.apppushflds", "system.schema.apppushfld"),
    newSystemScalar("system.schema.appinput", NS_SYSTEM_STRING),

    newSystemStruct("system.schema.appfieldvalarg", [
        { name: "label", type: NS_SYSTEM_STRING, displayOnly: true },
        { name: "type", type: "system.schema.valuetype", invisible: false, displayOnly: true },
        { name: "name", type: "system.schema.appaccessfld" },
        { name: "value", type: "system.schema.anyvalue" },
    ], [
        { field: "name", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "type" } ] },
        { field: "name", type: RelationType.Disable, func: "system.schema.isvaluenotnull", args: [ { name: "value" } ] },
        { field: "value", type: RelationType.Type, func: "system.schema.getexpvaluetype", args: [ { name: "type" } ] },
        { field: "value", type: RelationType.Disable, func: "system.schema.hideexpvalue", args: [ { name: "type" }, { name: "name" } ] },
    ]),
    newSystemArray("system.schema.appfieldvalargs", "system.schema.appfieldvalarg"),

    newSystemFunc("system.schema.appgetfieldtype", "system.schema.valuetype", [
        { name: "app", type: NS_SYSTEM_STRING },
        { name: "field", type: NS_SYSTEM_STRING },
    ], async (app: string, field: string) => {
        const appSchema = await getAppSchema(app)
        const fields = appSchema?.fields || []
        const paths = (field || "").split(".")
        if (paths.length === 0) return null
        let tarField: { type: string } | undefined = (fields || []).find((p:IAppFieldSchema) => p.name === paths[0])
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
                tarField = undefined
            }
        }
        return tarField?.type
    }),

    newSystemStruct("system.schema.appfieldrelation", [
        { name: "field", require: true, type: "system.schema.appaccessfld", },
        { name: "fieldType", displayOnly: true, invisible: false, type : "system.schema.valuetype", },
        { name: "return", displayOnly: true, invisible: true, type: "system.schema.valuetype", },
        { name: "type", require: true, type: "system.schema.relationtype", },
        { name: "func", require: true, type: "system.schema.functype", },
        { name: "args", type: "system.schema.appfieldvalargs", },
    ], [
        { field: "type", type: RelationType.WhiteList, func: "system.schema.getrelationwhitelist", args: [ { name: "fieldType" } ] },
        { field: "return", type: RelationType.Default, func: "system.schema.getrelationfuncreturn", args: [ { name: "fieldType" }, { name: "type" } ] },
        { field: "func", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "return" } ] }
    ]),
    newSystemArray("system.schema.appfieldrelations", "system.schema.appfieldrelation", "field", "type" ),

    newSystemFunc("system.schema.appgetsourceappblacklist", NS_SYSTEM_STRINGS, [
        { name: "app", type: NS_SYSTEM_STRING }
    ], (app: string) => {
        return app ? [app] : []
    }),

    newSystemFunc("system.schema.appgetsourceappfldinfo", "system.schema.valuetype", [
        { name: "sourceApp", type: NS_SYSTEM_STRING, nullable: true },
        { name: "sourceFld", type: NS_SYSTEM_STRING, nullable: true },
        { name: "info", type: NS_SYSTEM_STRING, nullable: true },
        { name: "type", type: NS_SYSTEM_STRING, nullable: true }
    ],  async (app: string, fld: string, info: string, type: string) => {
        if (app && fld)
        {
            const appSchema = await getAppSchema(app)
            const f = appSchema?.fields?.find((f: IAppFieldSchema) => f.name === fld)
            if (f) return (f as any)[info]
        }
        
        if (type)
        {
            const schema = await getSchema(type)
            if (schema)
            {
                if (info === "name") return schema.name.split(".").pop()
                else if(info === "display") return schema.display
            }
        }
        return null
    }),

    newSystemFunc("system.schema.appiscombineenable", NS_SYSTEM_BOOL, [
        { name: "type", type: NS_SYSTEM_STRING, nullable: true },
        { name: "func", type: NS_SYSTEM_STRING, nullable: true }
    ], (type: string, func: string) => {
        if (!type || !func) return false
        let schema = getCachedSchema(type)
        if (schema?.type === SchemaType.Array && schema.array?.element) schema = getCachedSchema(schema.array.element)
        return schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum
    }),

    newSystemFunc("system.schema.appiscombinesenable", NS_SYSTEM_BOOL, [
        { name: "type", type: NS_SYSTEM_STRING, nullable: true },
        { name: "func", type: NS_SYSTEM_STRING, nullable: true }
    ], async (type: string, func: string) => {
        if (!type || !func) return false
        let schema = await getSchema(type)
        if (schema?.type === SchemaType.Array)
            schema = schema.array?.element ? await getSchema(schema.array.element) : undefined
        return schema?.type === SchemaType.Struct
    }),
    
    newSystemFunc("system.schema.appistrackpushenable", NS_SYSTEM_BOOL, [
        { name: "field", type: NS_SYSTEM_STRING, nullable: true },
        { name: "func", type: NS_SYSTEM_STRING, nullable: true }
    ], (type: string, func: string) => {
        if (!type || !func) return false
        return true
    }),

    newSystemStruct("system.schema.appfieldschema", [
        { name: "app", type: NS_SYSTEM_STRING, readonly: true, invisible: true },
        { name: "name", type: "system.schema.varname", require: true, upLimit: 32 } ,
        { name: "type", type: "system.schema.valuetype", require: true },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "sourceApp", type: "system.schema.app" },
        { name: "sourceField", type: "system.schema.appfield" },
        { name: "trackPush", type: NS_SYSTEM_BOOL },
        { name: "incrUpdate", type: NS_SYSTEM_BOOL },
        { name: "frontend", type: NS_SYSTEM_BOOL },
        { name: "disable", type: NS_SYSTEM_BOOL },
        { name: "readonly", type: NS_SYSTEM_BOOL },
        { name: "func", type: "system.schema.pushfunctype" },
        { name: "args", type: "system.schema.apppushflds" },
        { name: "combine", type: "system.schema.datacombinetype" },
        { name: "combines", type: "system.schema.datacombines" },
    ], [
        { field: "name", type: RelationType.Default, func: "system.schema.appgetsourceappfldinfo", args: [ { name: "sourceApp" }, { name: "sourceField" }, { value: "name" }, { name: "type" }] },
        { field: "display", type: RelationType.Default, func: "system.schema.appgetsourceappfldinfo", args: [ { name: "sourceApp" }, { name: "sourceField" }, { value: "display" }, { name: "type" }] },
        { field: "desc", type: RelationType.Default, func: "system.schema.appgetsourceappfldinfo", args: [ { name: "sourceApp" }, { name: "sourceField" }, { value: "desc" }] },
        { field: "type", type: RelationType.Default, func: "system.schema.appgetsourceappfldinfo", args: [ { name: "sourceApp" }, { name: "sourceField" }, { value: "type" }] },
        { field: "sourceApp", type: RelationType.BlackList, func: "system.schema.appgetsourceappblacklist", args: [ { name: "app" }] },
        { field: "sourceField", type: RelationType.Visible, func: "system.logic.notnull", args: [ { name: "sourceApp" }] },
        { field: "sourceField", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "type" }] },
        { field: "func", type: RelationType.Root, func: "system.conv.assign", args: [ { name: "type" }] },
        { field: "args", type: RelationType.Visible, func: "system.logic.notnull", args: [ { name: "func" }] },
        { field: "frontend", type: RelationType.Visible, func: "system.logic.isnull", args: [ { name: "sourceApp" }] },
        { field: "combine", type: RelationType.Visible, func: "system.schema.appiscombineenable", args: [ { name: "type" }, { name: "func" }] },
        { field: "combines", type: RelationType.Visible, func: "system.schema.appiscombinesenable", args: [ { name: "type" }, { name: "func" }] },
        { field: "combines.field", type: RelationType.WhiteList, func: "system.schema.getstructnumbervaluefields", args: [ { name: "type" }] },
        { field: "trackPush", type: RelationType.Visible, func: "system.schema.appistrackpushenable", args: [ { name: "sourceField" }, { name: "func" }] }
    ]),
    
    newSystemFunc("system.schema.apphasfields", NS_SYSTEM_BOOL, [
        { name: "app", type: "system.schema.app", nullable: true },
    ], async (app: string) => {
        if (!app) return false
        const schema = await getAppSchema(app)
        return (schema?.hasFields || schema?.fields?.length) ? true : false
    }),
    
    newSystemStruct("system.schema.appschema", [
        { name: "name", require: true, type: "system.schema.appinput", upLimit: 32 },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "relations", type: "system.schema.appfieldrelations" },
    ], [
        { field: "relations.fieldType", type: RelationType.Default, func: "system.schema.appgetfieldtype", args: [ {     name: "name", }, {     name: "relations.field" } ] },
        { field: "relations", type: RelationType.Visible, func: "system.schema.apphasfields", args: [ {     name: "name" } ] }
    ]),

    newSystemFunc("system.schema.getworkflowmode", NS_SYSTEM_STRING, [
        { name: "type", type: "system.schema.workflowtype", nullable: true },
    ], async (type: string) => {
        if (!type) return null
        const schema = await getSchema(type)
        return schema?.workflow?.mode || null
    }),

    newSystemFunc("system.schema.getworkflowstatetype", NS_SYSTEM_STRING, [
        { name: "type", type: "system.schema.workflowtype", nullable: true },
    ], async (type: string) => {
        if (!type) return null
        const schema = await getSchema(type)
        return schema?.workflow?.state || "system.schema.anyvalue"
    }),

    newSystemFunc("system.schema.hasworkflowstatetype", NS_SYSTEM_BOOL, [
        { name: "type", type: "system.schema.workflowtype", nullable: true },
    ], async (type: string) => {
        if (!type) return null
        const schema = await getSchema(type)
        return schema?.workflow?.state ? true : false
    }),

    newSystemFunc("system.schema.haspreviousworkflow", NS_SYSTEM_BOOL, [
        { name: "previous", type: "system.schema.appworkflownodeschemas", nullable: true },
    ], (previous: any[]) => {
        return (previous && previous.length > 0) ? true : false
    }),

    newSystemStruct("system.schema.appworkflownodeschema", [
        { name: "name", type: "system.schema.varname", require: true, upLimit: 32 },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "fork", type: NS_SYSTEM_BOOL },
        { name: "type", type: "system.schema.workflowtype", require: true },
        { name: "mode", type: "system.schema.workflowmode", displayOnly: true, invisible: true },
        { name: "previous", type: "system.schema.appworkflows" },
        { name: "func", type: "system.schema.functype" },
        { name: "args", type: "system.schema.funcargs" },
        { name: "event", type: "system.schema.eventtype" },
        { name: "state", type: "system.schema.anyvalue" },
        { name: "payload", type: "system.schema.valuetype", require: true },
    ], [
        { field: "mode", type: RelationType.Default, func: "system.schema.getworkflowmode", args: [ { name: "type" } ]},
        { field: "func", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "mode" }, { value: WorkflowMode.Function } ] },
        { field: "args", type: RelationType.Visible, func: "system.logic.notnull", args: [ { name: "func" } ] },
        { field: "event", type: RelationType.Visible, func: "system.logic.equal", args: [ { name: "mode" }, { value: WorkflowMode.Event } ] },
        { field: "previous.$ele", type: RelationType.BlackList, func: "system.conv.assign", args: [ { name: "previous" } ] },
        { field: "state", type: RelationType.Type, func: "system.schema.getworkflowstatetype", args: [ { name: "type" } ] },
        { field: "state", type: RelationType.Visible, func: "system.schema.hasworkflowstatetype", args: [ { name: "type" } ] },
        { field: "payload", type: RelationType.Visible, func: "system.logic.notnull", args: [ { name: "type" } ] },
        { field: "type", type: RelationType.Root, func: "system.conv.assign", args: [ { value: "system.workflow" } ] },
    ]),
    newSystemArray("system.schema.appworkflownodeschemas", "system.schema.appworkflownodeschema", "name"),

    newSystemStruct("system.schema.appworkflowschema", [
        { name: "app", type: "system.schema.app", readonly: true, invisible: true },
        { name: "name", type: "system.schema.varname", require: true, upLimit: 32 },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "nodes", type: "system.schema.appworkflownodeschemas" },
    ],[
        { field: "nodes.previous", type: RelationType.Visible, func: "system.schema.haspreviousworkflow", args: [ { name: "nodes" } ] },
        { field: "nodes.previous.$ele", type: RelationType.WhiteList, func: "system.collection.getfields", args: [ { name: "nodes" }, { value: "name" } ] },
    ]),

    //#region frontend app schema
    newSystemFunc("frontend.appgetapptargets", NS_SYSTEM_STRINGS, [
        { name: "app", type: "system.schema.app", nullable: true }
    ], (app: string) => {
        if (isNull(app)) return []
        const appTargets = JSON.parse(localStorage["schema_app_targets"] || "{}")
        if (appTargets && typeof(appTargets) === "object") appTargets[app] || []
        return []
    }),

    newSystemStruct("frontend.apptarget", [
        { name: "allowApps", type: NS_SYSTEM_STRINGS, invisible: true },
        { name: "app", type: "system.schema.app", require: true },
        { name: "target", type: NS_SYSTEM_STRING, require: true, asSuggest: true, upLimit: 64 },
    ], [
        { field: "app", type: RelationType.WhiteList, func: "system.conv.assign", args: [ { name: "allowApps" } ] },
        { field: "target", type: RelationType.WhiteList, func: "frontend.appgetapptargets", args: [ { name: "app" } ] }
    ]),
    //#endregion
], SchemaLoadState.System)

//#region App Schema storage

// reload schemas from storage
export function reloadStorageAppSchemas()
{
    const namelist = localStorage["schema_custom_applist"]
    const list = namelist ? JSON.parse(namelist) : null
    if (!list || !Array.isArray(list)) return

    const schemas: IAppSchema[] = []
    for(let i = 0; i < list.length; i++)
    {
        const data = localStorage[`schema_app_${list[i]}`]
        const schema = data ? JSON.parse(data) : null
        if (!schema || typeof(schema) !== "object") continue
        schemas.push(schema)
    }
    registerAppSchema(schemas)
}

// save schema to storage
export function saveStorageAppSchema(schema: IAppSchema)
{
    // only save custom schema in the cache
    if (schema.loadState && (schema.loadState & SchemaLoadState.Custom) == 0) return

    schema = getAppCachedSchema(schema.name)! // reload to gets the fields
    const namelist = localStorage["schema_custom_applist"]
    let list: string[] = namelist ? JSON.parse(namelist) : []
    const name = schema.name.toLowerCase()
    if (!Array.isArray(list)) list = []
    if (!list.includes(name))
    {
        list.push(name)
        list.sort()
        localStorage["schema_custom_applist"] = JSON.stringify(list)
    }
    localStorage[`schema_app_${name}`] = JSON.stringify({
        name: schema.name,
        display: schema.display,
        desc: schema.desc,
        fields: schema.fields?.map((f: IAppFieldSchema) => ({
            name: f.name,
            type: f.type,
            display: f.display,
            desc: f.desc,
            sourceApp: f.sourceApp,
            sourceField: f.sourceField,
            func: f.func,
            args: f.args ? [...f.args] : undefined,
            incrUpdate: f.incrUpdate,
            frontend: f.frontend,
            disable: f.disable,
        })),
        relations: schema.relations?.map((r: IStructFieldRelation) => ({
            field: r.field,
            func: r.func,
            type: r.type,
            args: r.args?.map((a: IFunctionCallArgument)  => ({
                name: a.name,
                value: a.value
            }))
        }))
    })
}

// delete schema from storage
export function removeStorageAppSchema(name: string | IAppSchema)
{
    name = (typeof(name) === "object" ? name.name : name).toLowerCase()
    delete localStorage[`schema_app_${name}`]
    const namelist = localStorage["schema_custom_applist"]
    let list: string[] = namelist ? JSON.parse(namelist) : []
    if (Array.isArray(list) && list.includes(name))
    {
        const index = list.findIndex(n => n === name)
        if (index >= 0)
        {
            list.splice(index, 1)
            localStorage["schema_custom_applist"] = JSON.stringify(list)
        }
    }
}

// clear all stroage schemas
export function clearAllStorageAppSchemas()
{
    const namelist = localStorage["schema_custom_applist"]
    const list = namelist ? JSON.parse(namelist) : null
    if (!list || !Array.isArray(list)) return

    for(let i = 0; i < list.length; i++)
    {
        delete localStorage[`schema_app_${list[i]}`]
    }
    delete localStorage["schema_custom_applist"]
    location.reload()
}

// save all custom types to the storage
export function saveAllCustomAppSchemaToStroage(root: string = "")
{
    const schema = getAppCachedSchema(root)
    schema?.apps?.forEach((s: IAppSchema) => {
        if ((s.loadState || 0) & SchemaLoadState.Custom)
        {
            saveStorageAppSchema(s)
            if (s.apps?.length)
            {
                saveAllCustomAppSchemaToStroage(s.name)
            }
        }
    })
}

// export app schema
export function appSchemaToJson(f: IAppSchema, types?: string[]): IAppSchema
{
    const r: IAppSchema = { name: f.name, display: f.display, desc: f.desc }
    const isroot = isNull(types)
    types ||= []

    if (f.apps?.length)
    {
        r.apps = f.apps.map((a: IAppSchema) => appSchemaToJson(a, types))
    }
    else if(f.fields?.length)
    {
        r.fields = deepClone(f.fields, true)
        r.relations = deepClone(f.relations, true)

        r.fields?.forEach((f:IAppFieldSchema) => { if (!types.includes(f.type)) types.push(f.type) })
        r.relations?.forEach((r:IStructFieldRelation) => { if (!types.includes(r.func)) types.push(r.func) })
    }

    if (isroot && types?.length)
    {
        r.nodeSchemas = []
        types.forEach(t => gatherSchemas(r.nodeSchemas!, t))
    }

    return r
}

function gatherSchemas(types: INodeSchema[], name?: string)
{
    if (!name) return
    const schema = getCachedSchema(name)
    if (!schema || ((schema.loadState || 0) & SchemaLoadState.System)) return

    const access = name.split(".").filter(n => !isNull(n))

    let schemas: INodeSchema[] = types
    for (let i = 1; i < access.length; i++)
    {
        const ns = access.slice(0, i).join(".")
        const exist: INodeSchema | undefined = schemas?.find(s => s.name === ns)
        if (exist)
        {
            exist.schemas ||= []
            schemas = exist.schemas
        }
        else
        {
            const schema = getCachedSchema(ns)
            if (!schema) return
            const json: INodeSchema = { name: schema.name, type: schema.type, display: deepClone(schema.display), schemas: [] }
            schemas.push(json)
            schemas = json.schemas!
        }
    }
    if (schemas.findIndex(s => s.name === name) >= 0) return

    const r: INodeSchema = { name: schema.name, type: schema.type, display: deepClone(schema.display) }
    schemas.push(r)

    switch (schema.type)
    {
        case SchemaType.Scalar:
        {
            r.scalar = deepClone(schema.scalar, true)
            gatherSchemas(types, r.scalar?.base)
            gatherSchemas(types, r.scalar?.preValid)
            gatherSchemas(types, r.scalar?.postValid)
            break
        }
        case SchemaType.Enum:
        {
            r.enum = deepClone(schema.enum, true)
            if ((schema.loadState || 0) & SchemaLoadState.Server)
                r.enum!.values = []
            break
        }
        case SchemaType.Struct:
        {
            r.struct = deepClone(schema.struct, true)
            r.struct?.fields?.forEach((f: IStructFieldConfig) => gatherSchemas(types, f.type))
            r.struct?.relations?.forEach((r: IStructFieldRelation) => gatherSchemas(types, r.func))
            break
        }
        case SchemaType.Array:
        {
            r.array = deepClone(schema.array, true)
            gatherSchemas(types, r.array?.element)
            r.array?.relations?.forEach((r: IStructFieldRelation) => gatherSchemas(types, r.func))
            break
        }
        case SchemaType.Func:
        {
            r.func = { ...deepClone(schema.func!, true), func: undefined }
            if (!r.func!.exps) r.func!.exps = []
            if (!r.func!.args) r.func!.args = []

            gatherSchemas(types, r.func?.return)
            r.func?.args?.forEach((a: IFunctionArgumentInfo) => gatherSchemas(types, a.type))
            r.func?.exps?.forEach((e: IFunctionExpression) => gatherSchemas(types, e.func))
            break
        }
    }
}

export function addAppTarget(app: string, target: string)
{
    if (isNull(app) || isNull(target)) return

    let appTargets = JSON.parse(localStorage["schema_app_targets"] || "{}")
    if (isNull(appTargets) || typeof(appTargets) !== "object") appTargets = {}
    
    let targets: string[] = appTargets[app] || []
    if (!Array.isArray(targets)) targets = []
    if (!targets.includes(target)) {
        targets.unshift(target)
        appTargets[app] = targets
        localStorage["schema_app_targets"] = JSON.stringify(appTargets)
    }
}

//#endregion

//#region View

import waterFallView from "./view/waterFallView.vue"
import sourceappView from "./view/appSourceView.vue"
import appInputView from "./view/appInputView.vue"
import appsrcfldView from "./view/appSrcfldView.vue"
import appaccessfldView from "./view/appAccessfldView.vue"
import appPushfldsView from "./view/appPushfldsView.vue"
import structfldrelationinfosView from "./view/structfldrelationinfosView.vue"
import structfldfuncargsView from "./view/structfldfuncargsView.vue"
import { regSchemaTypeView } from "schema-node-vueview"

regSchemaTypeView("system.schema.app", sourceappView)
regSchemaTypeView("system.schema.appinput", appInputView)
regSchemaTypeView("system.schema.appfield", appsrcfldView)
regSchemaTypeView("system.schema.appaccessfld", appaccessfldView)
regSchemaTypeView("system.schema.apppushfld", appaccessfldView)
regSchemaTypeView("system.schema.apppushflds", appPushfldsView)
regSchemaTypeView("system.schema.appfieldrelations", structfldrelationinfosView)
regSchemaTypeView("system.schema.appfieldvalargs", structfldfuncargsView)
regSchemaTypeView("system.schema.appworkflownodeschemas", waterFallView)
//#endregion