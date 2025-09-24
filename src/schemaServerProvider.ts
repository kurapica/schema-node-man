import axios from "axios";
import { generateGuid, useSchemaProvider, type IAppSchema, type IEnumValueAccess, type IEnumValueInfo, type INodeSchema, type ISchemaProvider } from "schema-node";

/**
 * The schema server api provider interface
 * 
 * The schema server is used to save the schema definition and publish the changes to application servers.
 */
export interface ISchemaServerProvder extends ISchemaProvider
{
    /**
     * Save the schema to the server
     * @param schema the new or update schema
     * @returns result whether the schema is saved
     * @returns message the error message if provided
     */
    saveSchema(schema: INodeSchema): Promise<boolean>

    /**
     * Delete the schema from the server
     * @param schema the schema name
     * @returns result whether the schema is deleteed
     * @returns message the error message if provided
     */
    deleteSchema(schema: string): Promise<boolean>

    /**
     * Save the enum sub list for the given enum value
     * @param schema the enum schema name
     * @param value the enum value
     * @param values the sub enum values
     * @param append append the new values to the sub list
     * @returns result whether the sub list saved
     * @returns message the error message if provided
     */
    saveEnumSubList(schema: string, value: any, values: IEnumValueInfo[], append?: boolean): Promise<boolean>

    /**
     * Delete the enum sub list of the given enum value
     * @param schema the enum schema name
     * @param value the enum value
     * @returns result whether the sub list deleted
     * @returns message the error message if provided
     */
    deleteEnumSubList(schema: string, value: any): Promise<boolean>
}

//#region Methods
let schemaServerProvider: ISchemaServerProvder | null = null

async function postSchemaApi(url: string, param: any): Promise<any> {
    try
    {
        let site: string = localStorage["schema_server_url"] || ""
        if (!site) return null
        if (site.endsWith("/")) site = site.substring(0, site.length - 1)
        if (url.startsWith("/")) url = url.substring(1)
        const result: any = await axios.post(`${site}/${url}`, {
            jsonrpc: "2.0",
            method: "",
            id: generateGuid(),
            params: param
        })
        return result.result
    }
    catch(ex)
    {
        return null
    }
}

// Default schema
const defaultSchemaServerProvider: ISchemaServerProvder = {
    loadSchema: async (names: string[]): Promise<INodeSchema[]> => {
        console.log("load schema", names)
        return (await postSchemaApi("/load-schema", {
            names: names
        }))?.schemas || []
    },

    loadAppSchema: async (app: string): Promise<IAppSchema | undefined> => {
        return (await postSchemaApi("/load-app", {
            name: app
        }))?.schema
    },

    loadEnumSubList: async (name: string, value?: any, fullList?: boolean): Promise<IEnumValueInfo[]> => {
        return (await postSchemaApi("/load-enum-sub-list", {
            name, value, fullList
        }))?.values
    },

    loadEnumAccessList: async (name: string, value: any, noSubList?: boolean, withSubList?: boolean): Promise<IEnumValueAccess[]> => {
        return (await postSchemaApi("/load-enum-sub-list", {
            name, value, noSubList, withSubList
        }))?.access
    },

    callFunction: async (name: string, args: any[], generic?: string | string[]): Promise<any> => {
        return (await postSchemaApi("/load-enum-sub-list", {
            name, args, generic
        }))?.result
    },

    saveSchema: async (schema: INodeSchema): Promise<boolean> => {
        return (await postSchemaApi("/save-schema", {
            schema
        }))?.result
    },

    deleteSchema: async (name: string): Promise<boolean> => {
        return (await postSchemaApi("/delete-schema", {
            name
        }))?.result
    },

    saveEnumSubList: async (name: string, value: any, values: IEnumValueInfo[], append?: boolean): Promise<boolean> => {
        return (await postSchemaApi("/save-enum-sub-list", {
            name, value, values, append
        }))?.result
    },

    deleteEnumSubList: async (name: string, value: any): Promise<boolean> => {
        return (await postSchemaApi("/delete-enum-sub-list", {
            name, value
        }))?.result
    }
}
if (localStorage["schema_server_url"]) useSchemaProvider(defaultSchemaServerProvider)

/**
 * Set the schema site url
 */
export function setSchemaSite(url: string)
{
    localStorage["schema_server_url"] = url
    if (url && !schemaServerProvider) useSchemaProvider(defaultSchemaServerProvider)
}

/**
 * Get schema site url
 */
export function getSchemaSite()
{
    return localStorage["schema_server_url"]
}

/**
 * Sets the schema server api provider
 * @param provider the schema server api provider
 */
export function useSchemaServerProvider(provider: ISchemaServerProvder): void{
    schemaServerProvider = provider
    useSchemaProvider(provider)
}

/**
 * Gets the schema server provider
 * @returns the schema server provider
 */
export function getSchemaServerProvider() {
    return localStorage["schema_server_url"] ? defaultSchemaServerProvider : schemaServerProvider
}