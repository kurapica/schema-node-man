import { AppType as RunTimeAppType } from "schema-node-app";

// reload schemas from storage
export function reloadStorageAppSchemas() {
  const namelist = localStorage["schema_custom_applist"];
  const list = namelist ? JSON.parse(namelist) : null;
  if (!list || !Array.isArray(list)) return;

  const schemas: AppSchema[] = [];
  for (let i = 0; i < list.length; i++) {
    const data = localStorage[`schema_app_${list[i]}`];
    const schema = data ? JSON.parse(data) : null;
    if (!schema || typeof schema !== "object") continue;
    schemas.push(schema);
  }
  saveAppSchema(schemas);
}

// save schema to storage
export function saveStorageAppSchema(schema: AppSchema) {
  // only save frontend schema in the cache
  if (schema.loadState && (schema.loadState & SchemaLoadState.FrontEnd) == 0)
    return;

  schema = getCachedAppType(schema.name)?.getSchema() || schema; // reload to gets the fields
  
  const namelist = localStorage["schema_custom_applist"];
  let list: string[] = namelist ? JSON.parse(namelist) : [];
  const name = getAppSchemaName(schema);
  if (!Array.isArray(list)) list = [];
  if (!list.includes(name)) {
    list.push(name);
    list.sort();
    localStorage["schema_custom_applist"] = JSON.stringify(list);
  }
  const { apps, nodeSchemas, ...cloneSchema } = schema;
  localStorage[`schema_app_${name}`] = JSON.stringify(cloneSchema);
}

// delete schema from storage
export function removeStorageAppSchema(name: string | AppSchema) {
  name = (typeof name === "object" ? getAppSchemaName(name) : name).toLowerCase();
  delete localStorage[`schema_app_${name}`];
  const namelist = localStorage["schema_custom_applist"];
  let list: string[] = namelist ? JSON.parse(namelist) : [];
  if (Array.isArray(list) && list.includes(name)) {
    const index = list.findIndex((n) => n === name);
    if (index >= 0) {
      list.splice(index, 1);
      localStorage["schema_custom_applist"] = JSON.stringify(list);
    }
  }
}

// clear all stroage schemas
export function clearAllStorageAppSchemas() {
  const namelist = localStorage["schema_custom_applist"];
  const list = namelist ? JSON.parse(namelist) : null;
  if (!list || !Array.isArray(list)) return;

  for (let i = 0; i < list.length; i++) {
    delete localStorage[`schema_app_${list[i]}`];
  }
  delete localStorage["schema_custom_applist"];
  location.reload();
}

// save all custom types to the storage
export function saveAllCustomAppSchemaToStroage(root: string = "") {
  const schema = getCachedAppType(root);
  schema?.getSubAppSchemas()?.forEach((s: AppSchema) => {
    if ((s.loadState || 0) & SchemaLoadState.FrontEnd) {
      saveStorageAppSchema(s);
      if (s.apps?.length) {
        saveAllCustomAppSchemaToStroage(getAppSchemaName(s));
      }
    }
  });
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

//#endregion

//#region View

import sourceappView from "./view/appSourceView.vue";
import appInputView from "./view/appInputView.vue";
import appsrcfldView from "./view/appSrcfldView.vue";
import appaccessfldView from "./view/appAccessfldView.vue";
import apprelationinfosView from "./view/apprelationinfosView.vue";
import structfldfuncargsView from "./view/structfldfuncargsView.vue";
import appworkflownodeschemasView from "./view/appworkflownodeschemasView.vue";
import appWorkflowIdView from "./components/appWorkflowIdView.vue";
import forkKeyView from "./view/forkKeyView.vue";
import { regSchemaTypeView } from "schema-node-vueview";
import { AppSchema, getAppSchemaName, getCachedAppType, saveAppSchema } from "schema-node-app";
import { isNull, SchemaLoadState } from "schema-node-core";
import { AppType } from "vite";

regSchemaTypeView("system.schema.domain.app", sourceappView);
regSchemaTypeView("frontend.design.appinput", appInputView);
regSchemaTypeView("system.schema.domain.field", appsrcfldView);
regSchemaTypeView("frontend.design.appaccessfld", appaccessfldView);
regSchemaTypeView("frontend.design.appfieldrelations", apprelationinfosView);
regSchemaTypeView("frontend.design.appfieldvalargs", structfldfuncargsView);
regSchemaTypeView(
  "system.schema.def.app.workflow.nodes",
  appworkflownodeschemasView,
);
regSchemaTypeView("system.workflow.id", appWorkflowIdView);
regSchemaTypeView("frontend.design.forkeys", forkKeyView);
//#endregion
