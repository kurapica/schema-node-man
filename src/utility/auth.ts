import { setSchemaApiHeaders } from "schema-node-app"
import { FrontendAuth } from "../schema/auth"
import { deepClone } from "schema-node-core"

// auth
let auth: FrontendAuth = { savestorage: false, headers: [] }
try{
    const authStr = localStorage.getItem("schema-node-frontend-auth")
    if (authStr) auth = JSON.parse(authStr)
    setSchemaApiHeaders(auth.headers || [])
} catch (error) {
    console.error("Failed to parse auth data:", error)
}

/** Get the frontend auth */
export function getFrontendAuth() { return deepClone(auth) }

/** Save the frontend auth */
export function saveFrontendAuth(authData: FrontendAuth) {
    if (authData && authData.savestorage) {
        localStorage.setItem("schema-node-frontend-auth", JSON.stringify(authData))
    } else {
        localStorage.removeItem("schema-node-frontend-auth")
    }
    auth = authData ? deepClone(authData) : { savestorage: false, headers: [] }
    setSchemaApiHeaders(auth.headers || [])
}