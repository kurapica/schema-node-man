import { useSchemaProvider, type IEnumValueInfo, type INodeSchema, type ISchemaProvider } from "schema-node";

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
    saveSchema(schema: INodeSchema): Promise<{ result: boolean, message?: string }>

    /**
     * Delete the schema from the server
     * @param schema the schema name
     * @returns result whether the schema is deleteed
     * @returns message the error message if provided
     */
    deleteSchema(schema: string): Promise<{ result: boolean, message?: string }>

    /**
     * Save the enum sub list for the given enum value
     * @param schema the enum schema name
     * @param value the enum value
     * @param values the sub enum values
     * @param append append the new values to the sub list
     * @returns result whether the sub list saved
     * @returns message the error message if provided
     */
    saveEnumSubList(schema: string, value: any, values: IEnumValueInfo[], append?: boolean): Promise<{ result: boolean, message?: string}>

    /**
     * Delete the enum sub list of the given enum value
     * @param schema the enum schema name
     * @param value the enum value
     * @returns result whether the sub list deleted
     * @returns message the error message if provided
     */
    deleteEnumSubList(schema: string, value: any): Promise<{ result: boolean, message?: string}>
}

//#region Methods
let schemaServerProvider: ISchemaServerProvder | null = null

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
    return schemaServerProvider
}