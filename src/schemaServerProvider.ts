import { useAppDataProvider, type IAppFieldSchema, type IAppWorkflowSchema, type IAppSchema, type IEnumValueInfo, type INodeSchema, type IAppSchemaDataProvider, defaultAppSchemaProvider, setSchemaApiBaseUrl, getSchemaApiBaseUrl, postSchemaApi } from "schema-node"

/**
 * The schema server api provider interface
 * 
 * The schema server is used to save the schema definition and publish the changes to application servers.
 */
export interface ISchemaServerProvder extends IAppSchemaDataProvider
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
     * Save the app schema to the server
     * @param app the app schema to save
     */
    saveAppSchema(app: IAppSchema): Promise<boolean>

    /**
     * Delete the app schema from the server
     * @param app the app schema name to delete
     */
    deleteAppSchema(app: string): Promise<boolean>

    /**
     * Save the app field schema to the server
     * @param app the app schema name
     * @param field the app field schema to save
     */
    saveAppFieldSchema(app: string, field: IAppFieldSchema): Promise<boolean>

    /**
     * Delete the app field schema from the server
     * @param app the app schema name
     * @param field the app field schema name to delete
     */
    deleteAppFieldSchema(app: string, field: string): Promise<boolean>

    /**
     * Swap the app field schema order with another field
     * @param app the app schema name
     * @param field the app field schema name to swap
     * @param other the other app field schema name to swap
     */
    swapAppFieldSchema(app: string, field: string, other: string): Promise<boolean>

    /**
     * Save the app workflow schema to the server
     * @param app the app schema name
     * @param schema the workflow schema
     */
    saveAppWorkflowSchema(app: string, schema: IAppWorkflowSchema): Promise<boolean>

    /**
     * Delete the app workflow schema from the server
     * @param app the app schema name
     * @param workflow the workflow name
     */
    deleteAppWorkflowSchema(app: string, workflow: string): Promise<boolean>

    /**
     * Toggle the app workflow
     * @param app the app schema name
     * @param workflow the workflow name
     * @param active whether active
     */
    toggleAppWorkflowSchema(app: string, workflow: string, active: boolean): Promise<boolean>
}

//#region Methods
let schemaServerProvider: ISchemaServerProvder | null = null

// Default schema server provider
const defaultSchemaServerProvider: ISchemaServerProvder = {
    ...defaultAppSchemaProvider,

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

    saveAppSchema: async function (schema: IAppSchema): Promise<boolean> {
        return (await postSchemaApi("/save-app-schema", {
            schema
        }))?.result
    },

    deleteAppSchema: async function (app: string): Promise<boolean> {
        return (await postSchemaApi("/delete-app-schema", {
            app
        }))?.result
    },

    saveAppFieldSchema: async function (app: string, schema: IAppFieldSchema): Promise<boolean> {
        return (await postSchemaApi("/save-app-field-schema", {
            app, schema
        }))?.result
    },

    deleteAppFieldSchema: async function (app: string, field: string): Promise<boolean> {
        return (await postSchemaApi("/delete-app-field-schema", {
            app, field
        }))?.result
    },

    swapAppFieldSchema: async function (app: string, field: string, other: string): Promise<boolean> {
        return (await postSchemaApi("/swap-app-field-schema", {
            app, field, other
        }))?.result
    },

    saveAppWorkflowSchema: async function (app: string, schema: IAppWorkflowSchema): Promise<boolean> {
        return (await postSchemaApi("/save-app-workflow-schema", {
            app, schema
        }))?.result
    },
    
    deleteAppWorkflowSchema: async function (app: string, workflow: string): Promise<boolean> {
        return (await postSchemaApi("/delete-app-workflow-schema", {
            app, workflow
        }))?.result
    },

    toggleAppWorkflowSchema: async function (app: string, workflow: string, active: boolean): Promise<boolean> {
        return (await postSchemaApi("/toggle-app-workflow-schema", {
            app, workflow, active
        }))?.result
    }
}

if (localStorage["schema_server_url"]) 
    setSchemaApiBaseUrl(localStorage["schema_server_url"])

/**
 * Set the schema site url
 */
export function setSchemaSite(url: string)
{
    localStorage["schema_server_url"] = url
    setSchemaApiBaseUrl(url)
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
    useAppDataProvider(provider)
}

/**
 * Gets the schema server provider
 * @returns the schema server provider
 */
export function getSchemaServerProvider() {
    return schemaServerProvider ?? (getSchemaApiBaseUrl() ? defaultSchemaServerProvider : null)
}