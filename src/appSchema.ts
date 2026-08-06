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

  schema = getAppCachedSchema(schema.name)!; // reload to gets the fields
  const namelist = localStorage["schema_custom_applist"];
  let list: string[] = namelist ? JSON.parse(namelist) : [];
  const name = schema.name.toLowerCase();
  if (!Array.isArray(list)) list = [];
  if (!list.includes(name)) {
    list.push(name);
    list.sort();
    localStorage["schema_custom_applist"] = JSON.stringify(list);
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
      func: f.func,
      arg: f.arg,
      incrUpdate: f.incrUpdate,
      frontend: f.frontend,
      disable: f.disable,
    })),
    relations: schema.relations?.map((r: IStructRelationSchema) => ({
      field: r.field,
      func: r.func,
      type: r.type,
      args: r.args
        ?.filter((a) => !isNull(a.name) || !isNull(a.value))
        .map((a: IFunctionCallArgument) => ({
          name: a.name,
          value: a.value,
        })),
    })),
  });
}

// delete schema from storage
export function removeStorageAppSchema(name: string | AppSchema) {
  name = (typeof name === "object" ? name.name : name).toLowerCase();
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
  const schema = getAppCachedSchema(root);
  schema?.apps?.forEach((s: AppSchema) => {
    if ((s.loadState || 0) & SchemaLoadState.Custom) {
      saveStorageAppSchema(s);
      if (s.apps?.length) {
        saveAllCustomAppSchemaToStroage(s.name);
      }
    }
  });
}

// export app schema
export function appSchemaToJson(f: AppSchema, types?: string[]): AppSchema {
  const r: AppSchema = { name: f.name, display: f.display, desc: f.desc };
  const isroot = isNull(types);
  types ||= [];

  if (f.apps?.length) {
    r.apps = f.apps.map((a: AppSchema) => appSchemaToJson(a, types));
  } else if (f.fields?.length) {
    r.fields = deepClone(f.fields, true);
    r.relations = deepClone(f.relations, true);

    r.fields?.forEach((f: IAppFieldSchema) => {
      if (!types.includes(f.type)) types.push(f.type);
    });
    r.relations?.forEach((r: IStructRelationSchema) => {
      if (!types.includes(r.func)) types.push(r.func);
    });
  }

  if (isroot && types?.length) {
    r.nodeSchemas = [];
    types.forEach((t) => gatherSchemas(r.nodeSchemas!, t));
  }

  return r;
}

function gatherSchemas(types: INodeSchema[], name?: string) {
  if (!name) return;
  const schema = getCachedSchema(name);
  if (!schema || (schema.loadState || 0) & SchemaLoadState.System) return;

  const access = name.split(".").filter((n) => !isNull(n));

  let schemas: INodeSchema[] = types;
  for (let i = 1; i < access.length; i++) {
    const ns = access.slice(0, i).join(".");
    const exist: INodeSchema | undefined = schemas?.find((s) => s.name === ns);
    if (exist) {
      exist.schemas ||= [];
      schemas = exist.schemas;
    } else {
      const schema = getCachedSchema(ns);
      if (!schema) return;
      const json: INodeSchema = {
        name: schema.name,
        type: schema.type,
        display: deepClone(schema.display),
        schemas: [],
      };
      schemas.push(json);
      schemas = json.schemas!;
    }
  }
  if (schemas.findIndex((s) => s.name === name) >= 0) return;

  const r: INodeSchema = {
    name: schema.name,
    type: schema.type,
    display: deepClone(schema.display),
  };
  schemas.push(r);

  switch (schema.type) {
    case SchemaType.Scalar: {
      r.scalar = deepClone(schema.scalar, true);
      gatherSchemas(types, r.scalar?.base);
      gatherSchemas(types, r.scalar?.preValid);
      gatherSchemas(types, r.scalar?.postValid);
      break;
    }
    case SchemaType.Enum: {
      r.enum = deepClone(schema.enum, true);
      if ((schema.loadState || 0) & SchemaLoadState.Server) r.enum!.values = [];
      break;
    }
    case SchemaType.Struct: {
      r.struct = deepClone(schema.struct, true);
      r.struct?.fields?.forEach((f: IStructFieldSchema) =>
        gatherSchemas(types, f.type),
      );
      r.struct?.relations?.forEach((r: IStructRelationSchema) =>
        gatherSchemas(types, r.func),
      );
      break;
    }
    case SchemaType.Array: {
      r.array = deepClone(schema.array, true);
      gatherSchemas(types, r.array?.element);
      r.array?.relations?.forEach((r: IStructRelationSchema) =>
        gatherSchemas(types, r.func),
      );
      break;
    }
    case SchemaType.Func: {
      r.func = { ...deepClone(schema.func!, true), func: undefined };
      if (!r.func!.exps) r.func!.exps = [];
      if (!r.func!.args) r.func!.args = [];

      gatherSchemas(types, r.func?.return);
      r.func?.args?.forEach((a: IFunctionArgumentInfo) =>
        gatherSchemas(types, a.type),
      );
      r.func?.exps?.forEach((e: IFunctionExpression) =>
        gatherSchemas(types, e.func),
      );
      break;
    }
  }
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
import { AppSchema, saveAppSchema } from "schema-node-app";
import { SchemaLoadState } from "schema-node-core";

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
