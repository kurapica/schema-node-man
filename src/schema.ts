import { getCachedNodeType, getNodeSchemaName, NamespaceType, NodeSchema, saveNodeSchema, SCHEMA_KIND_NAMESPACE, SchemaLoadState } from "schema-node-core";

// reload schemas from storage
export function reloadStorageSchemas() {
  const namelist = localStorage["schema_custom_namelist"];
  const list = namelist ? JSON.parse(namelist) : null;
  if (!list || !Array.isArray(list)) return;

  const schemas: NodeSchema[] = [];
  for (let i = 0; i < list.length; i++) {
    const data = localStorage[`schema_data_${list[i]}`];
    const schema = data ? JSON.parse(data) : null;
    if (!schema || typeof schema !== "object") continue;
    schemas.push(schema);
  }
  saveNodeSchema(schemas, SchemaLoadState.FrontEnd);
}

// save schema to storage
export function saveStorageSchema(schema: NodeSchema) {
  // only save custom schema in the cache
  if (schema.loadState && (schema.loadState & SchemaLoadState.FrontEnd) == 0)
    return;

  // update name list
  const namelist = localStorage["schema_custom_namelist"];
  let list: string[] = namelist ? JSON.parse(namelist) : [];
  const name = getNodeSchemaName(schema).toLowerCase();
  if (!Array.isArray(list)) list = [];
  if (!list.includes(name)) {
    list.push(name);
    list.sort();
    localStorage["schema_custom_namelist"] = JSON.stringify(list);
  }

  // save schema
  const { schemas, ...clone } = schema
  localStorage[`schema_data_${name}`] = JSON.stringify(clone);
}

// delete schema from storage
export function removeStorageSchema(name: string | NodeSchema) {
  name = (typeof name === "object" ? getNodeSchemaName(name) : name).toLowerCase();
  delete localStorage[`schema_data_${name}`];
  const namelist = localStorage["schema_custom_namelist"];
  let list: string[] = namelist ? JSON.parse(namelist) : [];
  if (Array.isArray(list) && list.includes(name)) {
    const index = list.findIndex((n) => n === name);
    if (index >= 0) {
      list.splice(index, 1);
      localStorage["schema_custom_namelist"] = JSON.stringify(list);
    }
  }
}

// clear all stroage schemas
export function clearAllStorageSchemas() {
  const namelist = localStorage["schema_custom_namelist"];
  const list = namelist ? JSON.parse(namelist) : null;
  if (!list || !Array.isArray(list)) return;

  for (let i = 0; i < list.length; i++) {
    delete localStorage[`schema_data_${list[i]}`];
  }
  delete localStorage["schema_custom_namelist"];
  location.reload();
}

// save all custom types to the storage
export function saveAllCustomSchemaToStroage(root: string = "") {
  const schema = getCachedNodeType(root) as NamespaceType;
  schema?.getSubNodeSchemas()?.forEach((s: NodeSchema) => {
    if ((s.loadState || 0) & SchemaLoadState.FrontEnd) {
      saveStorageSchema(s);
      if (s.kind === SCHEMA_KIND_NAMESPACE)
        saveAllCustomSchemaToStroage(getNodeSchemaName(s));
    }
  });
}

//#region  View

/*
import namespaceView from "./view/namespaceView.vue";
import namespaceInputView from "./view/namespaceInputView.vue";
import enumvalueinfosView from "./view/enumvalueinfosView.vue";
import structfieldtypesView from "./view/structfieldtypesView.vue";
import structfldrelationinfosView from "./view/structfldrelationinfosView.vue";
import reltarfieldView from "./view/reltarfieldView.vue";
import structfldfuncargsView from "./view/structfldfuncargsView.vue";
import funcdefineView from "./view/funcdefineView.vue";
import { regSchemaTypeView } from "schema-node-vue-view";

regSchemaTypeView("system.schema.type.any", namespaceView);
regSchemaTypeView("system.schema.type.namespace", namespaceView);
regSchemaTypeView("system.schema.type.scalar", namespaceView);
regSchemaTypeView("system.schema.type.enum", namespaceView);
regSchemaTypeView("system.schema.type.struct", namespaceView);
regSchemaTypeView("system.schema.type.array", namespaceView);
regSchemaTypeView("system.schema.type.func", namespaceView);
regSchemaTypeView("system.schema.type.rule.valid", namespaceView);
regSchemaTypeView("system.schema.type.rule.whitelist", namespaceView);
regSchemaTypeView("system.schema.type.rule.predicate", namespaceView);
regSchemaTypeView("system.schema.type.rule.evaluator", namespaceView);
regSchemaTypeView("system.schema.type.rule.arrayelement", namespaceView);
regSchemaTypeView("system.schema.type.rule.value", namespaceView);
regSchemaTypeView("frontend.design.namespaceinput", namespaceInputView);

regSchemaTypeView("system.schema.def.enum.values", enumvalueinfosView);
regSchemaTypeView("frontend.design.enumintvalueinfos", enumvalueinfosView);
regSchemaTypeView("frontend.design.enumflagsvalueinfos", enumvalueinfosView);

regSchemaTypeView("system.schema.def.struct.fields", structfieldtypesView);
regSchemaTypeView( "system.schema.def.struct.relations", structfldrelationinfosView);
regSchemaTypeView("frontend.design.reltarfield", reltarfieldView);
regSchemaTypeView("frontend.design.structfldfuncargs", structfldfuncargsView);

regSchemaTypeView("system.schema.def.func.schema", funcdefineView);

//#endregion
*/