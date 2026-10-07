import { setSchemaApiHeaders } from "schema-node-app"
import { FrontendAuth } from "../schema/auth"
import { deepClone, isNull } from "schema-node-core"

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

export function addAppTarget(app: string, target: string) {
  if (isNull(app) || isNull(target)) return;

  let appTargets = JSON.parse(localStorage["schema_app_targets"] || "{}");
  if (isNull(appTargets) || typeof appTargets !== "object") appTargets = {};

  let targets: string[] = appTargets[app] || [];
  if (!Array.isArray(targets)) targets = [];
  if (!targets.includes(target)) {
    targets.unshift(target);
    appTargets[app] = targets;
    localStorage["schema_app_targets"] = JSON.stringify(appTargets);
  }
}
