import axios from "axios"
import { setSchemaApiHeaders } from "schema-node"
import { _LS, deepClone, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, registerSchema, SchemaLoadState, SchemaType } from "schema-node"

registerSchema([
    {
        name: "frontend",
        type: SchemaType.Namespace,
        display: _LS("frontend"),
        schemas: [
            {
                name: "frontend.header",
                type: SchemaType.Struct,
                struct: {
                    fields: [
                        {
                            name: "key",
                            type: NS_SYSTEM_STRING,
                            display: _LS("frontend.header.key"),
                            require: true
                        },
                        {
                            name: "value",
                            type: NS_SYSTEM_STRING,
                            display: _LS("frontend.header.value"),
                            require: true
                        }
                    ]
                }
            },
            {
                name: "frontend.headers",
                type: SchemaType.Array,
                display: _LS("frontend.header"),
                array: {
                    element: "frontend.header",
                    primary: ["key"]
                }
            },
            {
                name: "frontend.auth",
                type: SchemaType.Struct,
                display: _LS("frontend.auth"),
                struct: {
                    fields: [
                        {
                            name: "savestorage",
                            type: NS_SYSTEM_BOOL,
                            display: _LS("frontend.auth.savestorage"),
                        },
                        {
                            name: "headers",
                            type: "frontend.headers",
                            display: _LS("frontend.header"),
                        }
                    ]
                }
            }
        ]
    }
], SchemaLoadState.Frontend)

// auth
let auth: {
    savestorage: boolean,
    headers: { key: string, value: string }[]
} = { savestorage: false, headers: [] }
try{
    const authStr = localStorage.getItem("schema-node-frontend-auth")
    if (authStr) auth = JSON.parse(authStr)
    setSchemaApiHeaders(auth.headers || [])
} catch (error) {
    console.error("Failed to parse auth data:", error)
}

export function getFrontendAuth() {
    return deepClone(auth)
}

export function saveFrontendAuth(authData: any) {
    if (authData && authData.savestorage) {
        localStorage.setItem("schema-node-frontend-auth", JSON.stringify(authData))
    } else {
        localStorage.removeItem("schema-node-frontend-auth")
    }
    auth = authData ? deepClone(authData) : { savestorage: false, headers: [] }
    setSchemaApiHeaders(auth.headers || [])
}