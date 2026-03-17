import {
  type IStructFieldSchema,
  type IFunctionArgumentInfo,
  type IFunctionExpression,
  type IStructRelationSchema,
  type IFunctionCallArgument,
  type IAppFieldSchema,
  _LS,
  getAppCachedSchema,
  NS_SYSTEM_BOOL,
  NS_SYSTEM_STRING,
  registerAppSchema,
  registerSchema,
  SchemaLoadState,
  SchemaType,
  type IAppSchema,
  RelationType,
  NS_SYSTEM_STRINGS,
  getAppSchema,
  getSchema,
  ARRAY_ELEMENT,
  deepClone,
  type INodeSchema,
  isNull,
  getCachedSchema,
  _L,
  newSystemArray,
  newSystemFunc,
  newSystemScalar,
  newSystemStruct,
  NS_SYSTEM_LOCALE_STRING,
  WorkflowMode,
  NS_SYSTEM_ARRAY,
  NS_SYSTEM_OBJECT,
  PolicyScope,
  getFieldAccessWhiteList,
  FieldFilterMode,
  type FieldFilterModeValue,
  NS_SYSTEM_CONTEXT,
  AppScopeType,
  NS_SYSTEM_IDENTIFIER,
} from "schema-node";

// Schema for definition
registerSchema(
  [
    newSystemScalar("frontend.design.appaccessfld", NS_SYSTEM_STRING),
    newSystemScalar("frontend.design.appinput", NS_SYSTEM_STRING),

    newSystemFunc(
      "frontend.design.getappfieldnametype",
      "system.schema.type.rule.value",
      [],
      async (type: string, relation: RelationType) => {
        return relation === RelationType.Type &&
          type == "system.schema.type.rule.value"
          ? NS_SYSTEM_ARRAY
          : type;
      },
    ),

    newSystemFunc("frontend.design.getcontextwhitelist", "system.array", [], async() => {
      const contextSchema = await getSchema(NS_SYSTEM_CONTEXT)
      return await getFieldAccessWhiteList("", contextSchema?.struct?.fields || [])
    }),

    newSystemStruct("system.schema.def.app.scopecontextmap", [
      { name: "contextItem", type: NS_SYSTEM_STRING },
      { name: "mapKey", type: NS_SYSTEM_STRING }
    ], [
      {
        field: "contextItem",
        type: RelationType.WhiteList,
        func: "frontend.design.getcontextwhitelist",
        args: []
      }
    ]),
    newSystemArray("system.schema.def.app.scopecontextmaps", "system.schema.def.app.scopecontextmap", "contextItem"),

    newSystemStruct("system.schema.def.app.scopepolicy", [
      { name: "type", type: "system.schema.def.app.scope", require: true, default: AppScopeType.BusinessTarget },
      { name: "contextMaps", type: "system.schema.def.app.scopecontextmaps" }
    ], [
      {
        field: "contextMaps", 
        type: RelationType.Visible, 
        func: "system.logic.eq", 
        args: [{ name: "type" }, { value: AppScopeType.IsolationContext }]
      },
      {
        field: "businessKey",
        type: RelationType.Visible,
        func: "system.logic.eq",
        args: [{ name: "type" }, { value: AppScopeType.BusinessTarget }]
      }
    ]),

    newSystemStruct(
      "frontend.design.appfieldvalarg",
      [
        { name: "label", type: NS_SYSTEM_STRING, displayOnly: true },
        {
          name: "type",
          type: "system.schema.type.rule.value",
          invisible: false,
          displayOnly: true,
        },
        { name: "name", type: "frontend.design.appaccessfld" },
        { name: "value", type: NS_SYSTEM_OBJECT },
      ],
      [
        //{ field: "name", type: RelationType.Root, func: "system.intrinsic.assign", args: [ { name: "type" } ] },
        {
          field: "name",
          type: RelationType.Disable,
          func: "system.logic.notempty",
          args: [{ name: "value" }],
        },
        {
          field: "value",
          type: RelationType.Type,
          func: "frontend.design.getexpvaluetype",
          args: [{ name: "type" }],
        },
        {
          field: "value",
          type: RelationType.Disable,
          func: "frontend.design.hideexpvalue",
          args: [{ name: "type" }, { name: "name" }],
        },
      ],
    ),
    newSystemArray(
      "frontend.design.appfieldvalargs",
      "frontend.design.appfieldvalarg",
    ),

    newSystemStruct(
      "system.schema.def.app.field.filter",
      [
        {
          name: "mode",
          type: "system.schema.def.app.field.filtermode",
          require: true,
          default: FieldFilterMode.Exactly,
        },
        {
          name: "isFilter",
          type: NS_SYSTEM_BOOL,
          displayOnly: true,
          invisible: true,
        },
        { name: "filter", type: NS_SYSTEM_STRING, asSuggest: true },
        { name: "resolve", type: "system.schema.def.app.field.filterresolve" },
      ],
      [
        {
          field: "isFilter",
          type: RelationType.Default,
          func: "system.logic.eq",
          args: [{ name: "mode" }, { value: FieldFilterMode.Filter }],
        },
        {
          field: "filter",
          type: RelationType.Type,
          func: "system.logic.cond",
          args: [
            { name: "isFilter" },
            { value: "system.schema.type.rule.predicate" },
            { value: NS_SYSTEM_STRING },
          ],
        },
      ],
    ),
    newSystemArray(
      "system.schema.def.app.field.filters",
      "system.schema.def.app.field.filter",
      "filter",
    ),

    newSystemStruct(
      "system.schema.def.app.field.foreign",
      [
        { name: "field", type: NS_SYSTEM_STRING, require: true },
        { name: "app", type: "system.schema.domain.app", require: true },
      ]
    ),
    newSystemArray("system.schema.def.app.field.foreigns", "system.schema.def.app.field.foreign"),

    newSystemFunc(
      "frontend.design.appgetfieldtype",
      "system.schema.type.rule.value",
      [
        { name: "app", type: NS_SYSTEM_STRING },
        { name: "field", type: NS_SYSTEM_STRING },
      ],
      async (app: string, field: string) => {
        const appSchema = await getAppSchema(app);
        const fields = appSchema?.fields || [];
        const paths = (field || "").split(".");
        if (paths.length === 0) return null;
        let tarField: { type: string } | undefined = (fields || []).find(
          (p: IAppFieldSchema) => p.name === paths[0],
        );
        for (let i = 1; i < paths.length; i++) {
          if (!tarField) return null;

          let schema = await getSchema(tarField.type);
          if (schema?.type === SchemaType.Array && schema.array?.element) {
            schema = await getSchema(schema.array!.element);
          }

          if (paths[i] === ARRAY_ELEMENT) {
            return schema?.name;
          }

          if (schema?.type === SchemaType.Struct && schema.struct?.fields) {
            tarField = schema.struct.fields.find(
              (p: IStructFieldSchema) => p.name === paths[i],
            );
          } else {
            tarField = undefined;
          }
        }
        return tarField?.type;
      },
    ),

    newSystemStruct(
      "frontend.design.appfieldrelation",
      [
        { name: "field", require: true, type: "frontend.design.appaccessfld" },
        {
          name: "fieldType",
          displayOnly: true,
          invisible: true,
          type: "system.schema.type.rule.value",
        },
        {
          name: "return",
          displayOnly: true,
          invisible: true,
          type: "system.schema.type.rule.value",
        },
        { name: "type", require: true, type: "system.schema.def.struct.relationtype" },
        { name: "func", require: true, type: "system.schema.type.func" },
        { name: "args", type: "frontend.design.appfieldvalargs" },
      ],
      [
        {
          field: "type",
          type: RelationType.WhiteList,
          func: "frontend.design.getrelationwhitelist",
          args: [{ name: "fieldType" }],
        },
        {
          field: "return",
          type: RelationType.Default,
          func: "frontend.design.getrelationfuncreturn",
          args: [{ name: "fieldType" }, { name: "type" }],
        },
        {
          field: "func",
          type: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "return" }],
        },
        {
          field: "args.name",
          type: RelationType.Root,
          func: "frontend.design.getappfieldnametype",
          args: [{ name: "args.type" }, { name: "type" }],
        },
      ],
    ),
    newSystemArray(
      "frontend.design.appfieldrelations",
      "frontend.design.appfieldrelation",
      "field",
      "type",
    ),

    newSystemFunc(
      "frontend.design.gettypeinfoforappfield",
      "system.schema.type.rule.value",
      [
        { name: "info", type: NS_SYSTEM_STRING, nullable: true },
        { name: "type", type: NS_SYSTEM_STRING, nullable: true },
      ],
      async (info: string, type: string) => {
        if (type) {
          const schema = await getSchema(type);
          if (schema) {
            if (info === "name") return schema.name.split(".").pop();
            else if (info === "display") return schema.display;
          }
        }
        return null;
      },
    ),

    newSystemFunc(
      "frontend.design.appiscombineenable",
      NS_SYSTEM_BOOL,
      [
        { name: "type", type: NS_SYSTEM_STRING, nullable: true },
        { name: "func", type: NS_SYSTEM_STRING, nullable: true },
      ],
      (type: string, func: string) => {
        if (!type || !func) return false;
        let schema = getCachedSchema(type);
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = getCachedSchema(schema.array.element);
        return (
          schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum
        );
      },
    ),

    newSystemFunc(
      "frontend.design.appiscombinesenable",
      NS_SYSTEM_BOOL,
      [
        { name: "type", type: NS_SYSTEM_STRING, nullable: true },
        { name: "func", type: NS_SYSTEM_STRING, nullable: true },
      ],
      async (type: string, func: string) => {
        if (!type || !func) return false;
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array)
          schema = schema.array?.element
            ? await getSchema(schema.array.element)
            : undefined;
        return schema?.type === SchemaType.Struct;
      },
    ),

    newSystemFunc(
      "frontend.design.appistrackpushenable",
      NS_SYSTEM_BOOL,
      [
        { name: "field", type: NS_SYSTEM_STRING, nullable: true },
        { name: "func", type: NS_SYSTEM_STRING, nullable: true },
      ],
      (type: string, func: string) => {
        if (!type || !func) return false;
        return true;
      },
    ),

    newSystemStruct("system.schema.def.policy.row", [
      { name: "evaluator", type: "system.schema.type.rule.evaluator", require: true },
      { name: "filter", type: "system.schema.type.rule.predicate" },
    ]),
    newSystemArray(
      "system.schema.def.policy.rows",
      "system.schema.def.policy.row",
      "evaluator",
    ),

    newSystemStruct("system.schema.def.policy.col", [
      { name: "name", type: NS_SYSTEM_STRING, require: true },
      {
        name: "evaluators",
        type: "system.schema.type.rule.evaluators",
        require: true,
      },
    ]),
    newSystemArray(
      "system.schema.def.policy.cols",
      "system.schema.def.policy.col",
      "name",
    ),

    newSystemFunc(
      "frontend.design.getfieldforauths",
      NS_SYSTEM_ARRAY,
      [
        { name: "type", type: NS_SYSTEM_STRING, nullable: true },
      ],
      async (type: string) => {
        let fieldType = type ? await getSchema(type) : undefined;
        if (fieldType?.type === SchemaType.Array && fieldType.array?.element)
          fieldType = await getSchema(fieldType.array.element);

        if (fieldType?.type === SchemaType.Struct) {
          return fieldType.struct?.fields?.map((f: IStructFieldSchema) => ({
            value: f.name,
            label: _L(f.display) || f.name,
          }));
        }
        return [];
      },
    ),

    newSystemFunc(
      "frontend.design.showfieldfilterresolve",
      NS_SYSTEM_BOOL,
      [
        { name: "app", type: NS_SYSTEM_STRING, nullable: true },
        { name: "field", type: NS_SYSTEM_STRING, nullable: true },
        { name: "mode", type: "system.schema.def.app.field.filtermode", nullable: true },
        { name: "filter", type: NS_SYSTEM_STRING, nullable: true },
      ],
      async (app: string, field: string, mode: FieldFilterModeValue | undefined, filter: string) => {
        if (mode !== FieldFilterMode.Exactly) return false;
        const appSchema = app ? await getAppSchema(app) : undefined;
        const fieldSchema = appSchema?.fields?.find((f: IAppFieldSchema) => f.name === field);
        let fieldType = fieldSchema ? await getSchema(fieldSchema?.type || ""): undefined;
        if (fieldType?.type === SchemaType.Array && fieldType.array?.element)
          fieldType = await getSchema(fieldType.array.element);

        if (fieldType?.type === SchemaType.Struct) {
          const filterField = fieldType.struct?.fields?.find((f: IStructFieldSchema) => f.name === filter);
          const filterType = filterField ? await getSchema(filterField.type) : undefined;
          return filterType?.type === SchemaType.Enum && filterType.enum?.cascade?.length ? true : false;
        }
        return false
      }
    ),

    newSystemFunc(
      "frontend.design.getapppushsourcewhitelist",
      NS_SYSTEM_ARRAY,
      [
        { name: "app", type: NS_SYSTEM_STRING },
        { name: "name", type: NS_SYSTEM_STRING },
        { name: "func", type: NS_SYSTEM_STRING },
      ],
      async (app: string, name: string, func: string) => {
        const appSchema = await getAppSchema(app);
        const fields = (appSchema?.fields || []).filter((f) => f.name !== name);
        const funcSchema = await getSchema(func);
        if (
          !funcSchema ||
          funcSchema.type !== SchemaType.Func ||
          !funcSchema.func ||
          funcSchema.func.args?.length !== 1
        )
          return [];
        return await getFieldAccessWhiteList(
          funcSchema.func.args[0].type,
          fields,
          "",
          true,
          true,
        );
      },
    ),

    newSystemFunc(
      "frontend.design.hasjsonfield",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: NS_SYSTEM_STRING, nullable: true }],
      async (type: string) => {
        if (!type) return false;
        let schema = await getSchema(type);
        if (schema?.type !== SchemaType.Array || !schema.array?.element) return false
        schema = await getSchema(schema.array.element);
        if (schema?.type === SchemaType.Struct && schema.struct?.fields) {
          return schema.struct.fields.some((f: IStructFieldSchema) => f.type === "system.json");
        }
        return false;
      },
    ),

    newSystemStruct("system.schema.def.app.field.view", [
      { name: "app", type: "system.schema.domain.app" },
      { name: "field", type: NS_SYSTEM_STRING },
      { name: "map", type: NS_SYSTEM_STRING }
    ]),

    newSystemFunc("frontend.design.getavailablefieldviews", "system.array", [
      { name: "app", type: NS_SYSTEM_STRING, nullable: true },
      { name: "sourceApp", type: NS_SYSTEM_STRING, nullable: true }
    ], async (app: string, sourceApp: string) => {
      if (isNull(sourceApp)) return [];
      const sourceAppSChema = await getAppSchema(sourceApp);
      if (!sourceAppSChema?.fields?.length) return [];
      const whiteList = [];
      for (const field of sourceAppSChema.fields) {
        if (field.foreigns?.length && field.foreigns.some((f) => f.app === app)) {
        whiteList.push({
          value: `${field.name}`,
          label: _L(field.display) || field.name,
        });
        }
      }
      return whiteList;
    }),

    newSystemStruct(
      "system.schema.def.app.field.schema",
      [
        {
          name: "app",
          type: NS_SYSTEM_STRING,
          readonly: true,
          invisible: true,
        },
        {
          name: "name",
          type: NS_SYSTEM_IDENTIFIER,
          require: true,
          upLimit: 32,
        },
        { name: "type", type: "system.schema.type.rule.value", require: true },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "topology", type: "system.schema.def.app.field.topology" },
        { name: "tableName", type: NS_SYSTEM_STRING },
        { name: "attrTableName", type: NS_SYSTEM_STRING },
        { name: "incrUpdate", type: NS_SYSTEM_BOOL },
        { name: "frontend", type: NS_SYSTEM_BOOL },
        { name: "disable", type: NS_SYSTEM_BOOL },
        { name: "readonly", type: NS_SYSTEM_BOOL },
        { name: "func", type: "frontend.design.pushfunctype" },
        { name: "arg", type: NS_SYSTEM_STRING },
        { name: "combine", type: "system.schema.def.array.datacombinetype" },
        { name: "combines", type: "system.schema.def.array.datacombines" },
        { name: "auths", type: "system.schema.def.policy.items" },
        { name: "rowAuths", type: "system.schema.def.policy.rows" },
        { name: "colAuths", type: "system.schema.def.policy.cols" },
        { name: "filters", type: "system.schema.def.app.field.filters" },
        { name: "foreigns", type: "system.schema.def.app.field.foreigns" },
        { name: "view", type: "system.schema.def.app.field.view" },
      ],
      [
        {
          field: "name",
          type: RelationType.Default,
          func: "frontend.design.gettypeinfoforappfield",
          args: [
            { value: "name" },
            { name: "type" },
          ],
        },
        {
          field: "display",
          type: RelationType.Default,
          func: "frontend.design.gettypeinfoforappfield",
          args: [
            { value: "display" },
            { name: "type" },
          ],
        },
        {
          field: "topology",
          type: RelationType.Visible,
          func: "frontend.design.hasjsonfield",
          args: [{ name: "type" }],
        },
        {
          field: "tableName",
          type: RelationType.Invisible,
          func: "system.intrinsic.assign",
          args: [{ name: "frontend" } ],
        },
        {
          field: "attrTableName",
          type: RelationType.Invisible,
          func: "system.intrinsic.assign",
          args: [{ name: "frontend" } ],
        },
        {
          field: "func",
          type: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "type" }],
        },
        {
          field: "arg",
          type: RelationType.Visible,
          func: "system.logic.notnull",
          args: [{ name: "func" }],
        },
        {
          field: "arg",
          type: RelationType.WhiteList,
          func: "frontend.design.getapppushsourcewhitelist",
          args: [{ name: "app" }, { name: "name" }, { name: "func" }],
        },
        {
          field: "combine",
          type: RelationType.Visible,
          func: "frontend.design.appiscombineenable",
          args: [{ name: "type" }, { name: "func" }],
        },
        {
          field: "combines",
          type: RelationType.Visible,
          func: "frontend.design.appiscombinesenable",
          args: [{ name: "type" }, { name: "func" }],
        },
        {
          field: "combines.field",
          type: RelationType.WhiteList,
          func: "frontend.design.getstructnumbervaluefields",
          args: [{ name: "type" }],
        },
        {
          field: "colAuths",
          type: RelationType.Visible,
          func: "frontend.design.isstructorstructarray",
          args: [{ name: "type" }],
        },
        {
          field: "colAuths.name",
          type: RelationType.WhiteList,
          func: "frontend.design.getfieldforauths",
          args: [{ name: "type" }],
        },
        {
          field: "filters",
          type: RelationType.Visible,
          func: "frontend.design.isstructorstructarray",
          args: [{ name: "type" }],
        },
        {
          field: "filters.filter",
          type: RelationType.WhiteList,
          func: "frontend.design.getfieldforauths",
          args: [{ name: "type" }],
        },
        {
          field: "filters.resolve",
          type: RelationType.Visible,
          func: "frontend.design.showfieldfilterresolve",
          args: [{ name: "app" }, { name: "name" }, { name: "filters.mode" }, { name: "filters.filter" }],
        },
        {
          field: "foreigns.field",
          type: RelationType.WhiteList,
          func: "frontend.design.getfieldforauths",
          args: [{ name: "type" }],
        },
        {
          field: "view.field",
          type: RelationType.WhiteList,
          func: "frontend.design.getavailablefieldviews",
          args: [{ name: "app" }, { name: "view.app" }],
        },
        {
          field: "view.map",
          type: RelationType.WhiteList,
          func: "frontend.design.getfieldforauths",
          args: [{ name: "type" }],
        },
      ],
    ),

    newSystemFunc(
      "frontend.design.apphasfields",
      NS_SYSTEM_BOOL,
      [{ name: "app", type: "system.schema.domain.app", nullable: true }],
      async (app: string) => {
        if (!app) return false;
        const schema = await getAppSchema(app);
        return schema?.hasFields || schema?.fields?.length ? true : false;
      },
    ),

    newSystemStruct(
      "system.schema.def.app.schema",
      [
        {
          name: "name",
          require: true,
          type: "frontend.design.appinput",
          upLimit: 32,
          immutable: true,
        },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "scopePolicy", type: "system.schema.def.app.scopepolicy"},
        { name: "auth", type: "system.schema.type.policy" },
        { name: "auths", type: "system.schema.def.policy.items" },
        { name: "relations", type: "frontend.design.appfieldrelations" },
      ],
      [
        {
          field: "relations.fieldType",
          type: RelationType.Default,
          func: "frontend.design.appgetfieldtype",
          args: [{ name: "name" }, { name: "relations.field" }],
        },
        {
          field: "relations",
          type: RelationType.Visible,
          func: "frontend.design.apphasfields",
          args: [{ name: "name" }],
        },
        {
          field: "auths.scope",
          type: RelationType.WhiteList,
          func: "frontend.design.getappschemapolicyscope",
          args: [],
        },
      ],
    ),

    newSystemFunc(
      "frontend.design.getworkflowmode",
      NS_SYSTEM_STRING,
      [{ name: "type", type: "system.schema.type.workflow", nullable: true }],
      async (type: string) => {
        if (!type) return null;
        const schema = await getSchema(type);
        return schema?.workflow?.mode || null;
      },
    ),

    newSystemFunc(
      "frontend.design.getworkflowstatetype",
      NS_SYSTEM_STRING,
      [{ name: "type", type: "system.schema.type.workflow", nullable: true }],
      async (type: string) => {
        if (!type) return null;
        const schema = await getSchema(type);
        return schema?.workflow?.state || NS_SYSTEM_OBJECT;
      },
    ),

    newSystemFunc(
      "frontend.design.hasworkflowstatetype",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.workflow", nullable: true }],
      async (type: string) => {
        if (!type) return null;
        const schema = await getSchema(type);
        return schema?.workflow?.state ? true : false;
      },
    ),

    newSystemFunc(
      "frontend.design.haspreviousworkflow",
      NS_SYSTEM_BOOL,
      [
        {
          name: "previous",
          type: "system.schema.def.app.workflow.nodes",
          nullable: true,
        },
      ],
      (previous: any[]) => {
        return previous && previous.length > 0 ? true : false;
      },
    ),

    newSystemFunc(
      "frontend.design.hasworkflowargs",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.workflow", nullable: true }],
      async (type: string) => {
        if (!type) return null;
        const schema = await getSchema(type);
        return schema?.workflow?.args?.length ? true : false;
      },
    ),

    newSystemFunc(
      "frontend.design.showforkkey",
      NS_SYSTEM_BOOL,
      [
        { name: "fork", type: NS_SYSTEM_BOOL, nullable: true },
        { name: "payload", type: "system.schema.type.rule.value", nullable: true },
      ],
      async (fork?: boolean, payload?: string) => {
        if (!fork || isNull(payload)) return false;
        const schema = await getSchema(payload!);
        return schema && schema.type !== SchemaType.Array;
      },
    ),

    newSystemFunc(
      "frontend.design.showfork",
      NS_SYSTEM_BOOL,
      [{ name: "mode", type: "system.workflow.mode", nullable: true }],
      (mode: string) => {
        return mode !== WorkflowMode.Function;
      },
    ),

    newSystemFunc(
      "frontend.design.getworkflowpolicyscopes",
      "system.schema.def.policy.scopes",
      [],
      () => {
        return [PolicyScope.FuncExecute];
      },
    ),

    {
      name: "frontend.design.forkeys",
      type: SchemaType.Array,
      display: _LS("frontend.design.forkeys"),
      loadState: SchemaLoadState.System,
      array: {
        element: NS_SYSTEM_STRING,
        single: true,
      },
    },

    newSystemStruct(
      "system.schema.def.app.workflow.node",
      [
        {
          name: "app",
          type: "system.schema.domain.app",
          displayOnly: true,
          invisible: true,
        },
        {
          name: "name",
          type: NS_SYSTEM_IDENTIFIER,
          require: true,
          upLimit: 32,
        },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "type", type: "system.schema.type.workflow", require: true },
        {
          name: "mode",
          type: "system.workflow.mode",
          displayOnly: true,
          invisible: true,
        },
        { name: "fork", type: NS_SYSTEM_BOOL },
        { name: "forkKey", type: "frontend.design.forkeys" },
        { name: "unCancelable", type: NS_SYSTEM_BOOL },
        { name: "cancelPre", type: NS_SYSTEM_BOOL },
        { name: "payloadSave", type: NS_SYSTEM_BOOL },
        { name: "args", type: "system.schema.def.func.callargs" },
        { name: "previous", type: NS_SYSTEM_STRINGS },
        { name: "event", type: "system.schema.type.event" },
        { name: "state", type: NS_SYSTEM_OBJECT },
        { name: "func", type: "system.schema.type.func" },
        { name: "payload", type: "system.schema.type.rule.value" },
        { name: "funcArgs", type: "system.schema.def.func.callargs" },
      ],
      [
        {
          field: "args",
          type: RelationType.Visible,
          func: "frontend.design.hasworkflowargs",
          args: [{ name: "type" }],
        },
        {
          field: "mode",
          type: RelationType.Default,
          func: "frontend.design.getworkflowmode",
          args: [{ name: "type" }],
        },
        {
          field: "fork",
          type: RelationType.Visible,
          func: "frontend.design.showfork",
          args: [{ name: "mode" }],
        },
        {
          field: "func",
          type: RelationType.Visible,
          func: "system.logic.eq",
          args: [{ name: "mode" }, { value: WorkflowMode.Function }],
        },
        {
          field: "funcArgs",
          type: RelationType.Visible,
          func: "system.logic.notnull",
          args: [{ name: "func" }],
        },
        {
          field: "event",
          type: RelationType.Visible,
          func: "system.logic.eq",
          args: [{ name: "mode" }, { value: WorkflowMode.Event }],
        },
        {
          field: "previous.$ele",
          type: RelationType.BlackList,
          func: "system.intrinsic.assign",
          args: [{ name: "previous" }],
        },
        {
          field: "state",
          type: RelationType.Type,
          func: "frontend.design.getworkflowstatetype",
          args: [{ name: "type" }],
        },
        {
          field: "state",
          type: RelationType.Visible,
          func: "frontend.design.hasworkflowstatetype",
          args: [{ name: "type" }],
        },
        {
          field: "payload",
          type: RelationType.Visible,
          func: "system.logic.notnull",
          args: [{ name: "type" }],
        },
        {
          field: "type",
          type: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ value: "system.workflow" }],
        },
        //{ field: "event", type: RelationType.Root, func: "system.intrinsic.assign", args: [ { value: "system.event" } ] },
        {
          field: "forkKey",
          type: RelationType.Visible,
          func: "frontend.design.showforkkey",
          args: [{ name: "fork" }, { name: "payload" }],
        },
        {
          field: "cancelPre",
          type: RelationType.Visible,
          func: "system.logic.notempty",
          args: [{ name: "forkKey" }],
        },
        {
          field: "unCancelable",
          type: RelationType.Invisible,
          func: "system.intrinsic.assign",
          args: [{ name: "fork" }],
        },
        {
          field: "payloadSave",
          type: RelationType.Visible,
          func: "system.logic.notnull",
          args: [{ name: "payload" }],
        },
      ],
    ),
    newSystemArray(
      "system.schema.def.app.workflow.nodes",
      "system.schema.def.app.workflow.node",
      "name",
    ),

    newSystemStruct(
      "system.schema.def.app.workflow.schema",
      [
        {
          name: "app",
          type: "system.schema.domain.app",
          readonly: true,
          invisible: true,
        },
        {
          name: "name",
          type: NS_SYSTEM_IDENTIFIER,
          require: true,
          upLimit: 32,
        },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "auths", type: "system.schema.def.policy.items" },
        { name: "nodes", type: "system.schema.def.app.workflow.nodes" },
      ],
      [
        {
          field: "nodes.previous",
          type: RelationType.Visible,
          func: "frontend.design.haspreviousworkflow",
          args: [{ name: "nodes" }],
        },
        {
          field: "nodes.previous.$ele",
          type: RelationType.WhiteList,
          func: "system.str.map.toentrys",
          args: [{ name: "nodes" }, { value: "name" }, { value: "display" }],
        },
        {
          field: "nodes.app",
          type: RelationType.Default,
          func: "system.intrinsic.assign",
          args: [{ name: "app" }],
        },
        {
          field: "auths.scope",
          type: RelationType.WhiteList,
          func: "frontend.design.getworkflowpolicyscopes",
          args: [],
        },
      ],
    ),

    //#region frontend app schema
    newSystemFunc(
      "frontend.appgetapptargets",
      NS_SYSTEM_STRINGS,
      [{ name: "app", type: "system.schema.domain.app", nullable: true }],
      (app: string) => {
        if (isNull(app)) return [];
        const appTargets = JSON.parse(
          localStorage["schema_app_targets"] || "{}",
        );
        if (appTargets && typeof appTargets === "object")
          return appTargets[app] || [];
        return [];
      },
    ),

    newSystemFunc("frontend.notsystemapp", NS_SYSTEM_BOOL, [{ name: "app", type: "system.schema.domain.app" }],  async (app: string) => {
      const appSchema = await getAppSchema(app);
      return appSchema?.scopePolicy?.type !== AppScopeType.SystemLevel;
    }),

    newSystemStruct(
      "frontend.apptarget",
      [
        { name: "allowApps", type: NS_SYSTEM_STRINGS, invisible: true },
        { name: "app", type: "system.schema.domain.app", require: true },
        {
          name: "target",
          type: NS_SYSTEM_STRING,
          require: true,
          asSuggest: true,
          upLimit: 64,
        },
      ],
      [
        {
          field: "app",
          type: RelationType.WhiteList,
          func: "system.intrinsic.assign",
          args: [{ name: "allowApps" }],
        },
        {
          field: "target",
          type: RelationType.WhiteList,
          func: "frontend.appgetapptargets",
          args: [{ name: "app" }],
        },
        {
          field: "target",
          type: RelationType.Visible,
          func: "frontend.notsystemapp",
          args: [{ name: "app" }],
        }
      ],
    ),
    //#endregion
  ],
  SchemaLoadState.System,
);

//#region App Schema storage

// reload schemas from storage
export function reloadStorageAppSchemas() {
  const namelist = localStorage["schema_custom_applist"];
  const list = namelist ? JSON.parse(namelist) : null;
  if (!list || !Array.isArray(list)) return;

  const schemas: IAppSchema[] = [];
  for (let i = 0; i < list.length; i++) {
    const data = localStorage[`schema_app_${list[i]}`];
    const schema = data ? JSON.parse(data) : null;
    if (!schema || typeof schema !== "object") continue;
    schemas.push(schema);
  }
  registerAppSchema(schemas);
}

// save schema to storage
export function saveStorageAppSchema(schema: IAppSchema) {
  // only save custom schema in the cache
  if (schema.loadState && (schema.loadState & SchemaLoadState.Custom) == 0)
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
export function removeStorageAppSchema(name: string | IAppSchema) {
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
  schema?.apps?.forEach((s: IAppSchema) => {
    if ((s.loadState || 0) & SchemaLoadState.Custom) {
      saveStorageAppSchema(s);
      if (s.apps?.length) {
        saveAllCustomAppSchemaToStroage(s.name);
      }
    }
  });
}

// export app schema
export function appSchemaToJson(f: IAppSchema, types?: string[]): IAppSchema {
  const r: IAppSchema = { name: f.name, display: f.display, desc: f.desc };
  const isroot = isNull(types);
  types ||= [];

  if (f.apps?.length) {
    r.apps = f.apps.map((a: IAppSchema) => appSchemaToJson(a, types));
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
