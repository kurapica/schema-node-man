import {
  _L,
  _LS,
  ARRAY_ELEMENT,
  ARRAY_ITSELF,
  deepClone,
  EnumValueType,
  ExpressionType,
  RecognizerPartType,
  getArraySchema,
  getCachedSchema,
  getSchema,
  isNull,
  isSchemaCanBeUseAs,
  isStructFieldIndexable,
  newSystemArray,
  newSystemEnum,
  newSystemFunc,
  newSystemRelArray,
  newSystemScalar,
  newSystemStruct,
  NS_SYSTEM_ARRAY,
  NS_SYSTEM_BOOL,
  NS_SYSTEM_ENTRIES,
  NS_SYSTEM_IDENTIFIER,
  NS_SYSTEM_INT,
  NS_SYSTEM_INTS,
  NS_SYSTEM_JSON,
  NS_SYSTEM_LOCALE_STRING,
  NS_SYSTEM_LOCALE_STRINGS,
  NS_SYSTEM_NUMBER,
  NS_SYSTEM_OBJECT,
  NS_SYSTEM_STRING,
  NS_SYSTEM_STRINGS,
  PolicyCombine,
  PolicyScope,
  registerSchema,
  RelationType,
  SchemaLoadState,
  SchemaType,
  type IFunctionExpression,
  type ILocaleString,
  type INodeSchema,
  type IStructFieldSchema,
  type IStructRelationSchema,
} from "schema-node";

// Schema for definition
registerSchema(
  [
    //#region system scalars
    newSystemScalar(
      "frontend.design.namespaceinput",
      NS_SYSTEM_STRING,
      undefined,
      "^[a-z]\\w*(.[a-z]\\w*)*$",
      { upLimit: 128 },
    ),
    newSystemScalar(
      "frontend.design.reltarfield",
      NS_SYSTEM_STRING,
      undefined,
      undefined,
      { upLimit: 64 },
    ),
    //#endregion

    //#region enum definition
    newSystemFunc(
      "frontend.design.calcnextflag",
      NS_SYSTEM_INT,
      [{ name: "values", type: NS_SYSTEM_INTS }],
      (values: any[]) => {
        if (!Array.isArray(values) || values.length == 0) return 0;
        const last = values[values.length - 1];
        return !last?.value ? 1 : last.value * 2;
      },
    ),

    newSystemStruct("system.schema.def.enum.value", [
      { name: "value", type: NS_SYSTEM_STRING, require: true, immutable: true },
      { name: "name", type: NS_SYSTEM_LOCALE_STRING, require: true },
      { name: "disable", type: NS_SYSTEM_BOOL, default: false },
    ]),
    newSystemArray(
      "system.schema.def.enum.values",
      "system.schema.def.enum.value",
      "value",
    ),

    newSystemStruct("frontend.design.enumintvalueinfo", [
      { name: "value", type: NS_SYSTEM_INT, require: true, immutable: true },
      { name: "name", type: NS_SYSTEM_LOCALE_STRING, require: true },
      { name: "disable", type: NS_SYSTEM_BOOL, default: false },
    ]),
    newSystemArray(
      "frontend.design.enumintvalueinfos",
      "frontend.design.enumintvalueinfo",
      "value",
    ),

    newSystemStruct("frontend.design.enumflagvalueinfo", [
      { name: "value", type: NS_SYSTEM_INT, require: true, immutable: true },
      { name: "name", type: NS_SYSTEM_LOCALE_STRING, require: true },
      { name: "disable", type: NS_SYSTEM_BOOL, default: false },
    ]),
    newSystemRelArray(
      "frontend.design.enumflagsvalueinfos",
      "frontend.design.enumflagvalueinfo",
      [
        {
          field: "value",
          property: RelationType.Assign,
          func: "frontend.design.calcnextflag",
          args: [{ name: ARRAY_ITSELF }],
        },
      ],
      "value",
    ),

    newSystemFunc(
      "frontend.design.getenuminfostype",
      "system.schema.type.array",
      [{ name: "type", type: "system.schema.def.enum.valuetype" }],
      (type: EnumValueType) => {
        switch (type) {
          case EnumValueType.String:
            return "system.schema.def.enum.values";
          case EnumValueType.Int:
            return "frontend.design.enumintvalueinfos";
          case EnumValueType.Flags:
            return "frontend.design.enumflagsvalueinfos";
        }
      },
    ),

    newSystemStruct(
      "system.schema.def.enum.schema",
      [
        {
          name: "type",
          type: "system.schema.def.enum.valuetype",
          require: true,
          default: EnumValueType.Int,
        },
        { name: "cascade", type: NS_SYSTEM_LOCALE_STRINGS },
        { name: "values", type: "system.schema.def.enum.values" },
      ],
      [
        {
          field: "cascade",
          property: RelationType.Invisible,
          func: "system.logic.eq",
          args: [{ name: "type" }, { value: EnumValueType.Flags }],
        },
        {
          field: "values",
          property: RelationType.Type,
          func: "frontend.design.getenuminfostype",
          args: [{ name: "type" }],
        },
      ],
    ),
    //#endregion

    //#region struct definition
    newSystemFunc(
      "frontend.design.getexpvaluetype",
      "system.schema.type.rule.value",
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array)
          schema = schema.array?.element
            ? await getSchema(schema.array.element)
            : undefined;
        if (
          schema?.type === SchemaType.Scalar ||
          schema?.type === SchemaType.Enum
        )
          return type;
        return NS_SYSTEM_STRING;
      },
    ),

    newSystemFunc(
      "frontend.design.hideexpvalue",
      "system.schema.type.rule.value",
      [
        { name: "type", type: "system.schema.type.rule.value" },
        { name: "name", type: NS_SYSTEM_STRING },
      ],
      async (type: string, name: string) => {
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array)
          schema = schema.array?.element
            ? await getSchema(schema.array.element)
            : undefined;
        if (
          schema?.type === SchemaType.Scalar ||
          schema?.type === SchemaType.Enum
        )
          return !isNull(name);
        return true;
      },
    ),

    newSystemStruct(
      "frontend.design.structfldfuncarg",
      [
        { name: "label", type: NS_SYSTEM_STRING, displayOnly: true },
        { name: "type", type: "system.schema.type.rule.value", readonly: true },
        { name: "name", type: "frontend.design.reltarfield" },
        { name: "value", type: NS_SYSTEM_OBJECT },
      ],
      [
        {
          field: "name",
          property: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "type" }],
        },
        {
          field: "name",
          property: RelationType.Disable,
          func: "system.logic.notempty",
          args: [{ name: "value" }],
        },
        {
          field: "value",
          property: RelationType.Type,
          func: "frontend.design.getexpvaluetype",
          args: [{ name: "type" }],
        },
        {
          field: "value",
          property: RelationType.Disable,
          func: "frontend.design.hideexpvalue",
          args: [{ name: "type" }, { name: "name" }],
        },
      ],
    ),
    newSystemArray(
      "frontend.design.structfldfuncargs",
      "frontend.design.structfldfuncarg",
    ),

    newSystemFunc(
      "frontend.design.isscalartype",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        const schema = await getSchema(type);
        return schema?.type === SchemaType.Scalar;
      },
    ),

    newSystemFunc(
      "frontend.design.isscalarenumtype",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value", nullable: true }],
      async (type: string) => {
        let schema = type ? await getSchema(type) : null;
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = await getSchema(schema.array.element);
        return (
          schema?.type === SchemaType.Scalar || schema?.type === SchemaType.Enum
        );
      },
    ),

    newSystemFunc(
      "frontend.design.iscascadeenumtype",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = await getSchema(schema.array.element);
        return (
          schema?.type === SchemaType.Enum &&
          schema.enum?.cascade &&
          schema.enum.cascade.length > 1
        );
      },
    ),

    newSystemFunc(
      "frontend.design.getroottype",
      "system.schema.type.rule.value",
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = await getSchema(schema.array.element);
        return schema?.type === SchemaType.Scalar ||
          schema?.type === SchemaType.Enum
          ? schema?.name
          : NS_SYSTEM_STRING;
      },
    ),

    newSystemFunc(
      "frontend.design.isflagsenumtype",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        const schema = await getSchema(type);
        return (
          schema?.type === SchemaType.Enum &&
          schema.enum?.type === EnumValueType.Flags
        );
      },
    ),

    newSystemFunc(
      "frontend.design.getenumcascadewhitelist",
      NS_SYSTEM_ARRAY,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = await getSchema(schema.array.element);
        if (
          schema?.type === SchemaType.Enum &&
          schema.enum?.cascade &&
          schema.enum.cascade.length > 1
        ) {
          return schema.enum.cascade.map((item: ILocaleString, i: number) => ({
            value: i + 1,
            label: _L(item),
          }));
        }
        return null;
      },
    ),

    newSystemFunc(
      "frontend.design.isenumroot",
      NS_SYSTEM_BOOL,
      [
        { name: "type", type: "system.schema.type.rule.value" },
        { name: "cascade", type: NS_SYSTEM_INT, nullable: true },
      ],
      async (type: string, cascade?: number) => {
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = await getSchema(schema.array.element);
        if (
          schema?.type === SchemaType.Enum &&
          schema.enum?.cascade &&
          schema.enum.cascade.length > 1
        ) {
          return cascade != 1;
        }
        return false;
      },
    ),

    newSystemFunc(
      "frontend.design.getenumrootcascade",
      NS_SYSTEM_INT,
      [
        { name: "type", type: "system.schema.type.rule.value" },
        { name: "cascade", type: NS_SYSTEM_INT, nullable: true },
      ],
      async (type: string, cascade?: number) => {
        if (cascade) return cascade - 1;
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = await getSchema(schema.array.element);
        if (
          schema?.type === SchemaType.Enum &&
          schema.enum?.cascade &&
          schema.enum.cascade.length > 1
        )
          return schema.enum.cascade.length - 1;
        return 0;
      },
    ),

    newSystemFunc(
      "frontend.design.getwhiteblacklisttype",
      "system.schema.type.rule.value",
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        const schema = await getSchema(type);
        if (
          schema?.type === SchemaType.Array ||
          schema?.type === SchemaType.Struct
        )
          return NS_SYSTEM_STRINGS;
        const arraySchema = await getArraySchema(type);
        return arraySchema?.name;
      },
    ),

    newSystemFunc(
      "frontend.design.getscalarorenumtype",
      "system.schema.type.rule.value",
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        const schema = await getSchema(type);
        return schema?.type === SchemaType.Scalar ||
          schema?.type === SchemaType.Enum
          ? type
          : NS_SYSTEM_STRING;
      },
    ),

    newSystemFunc(
      "frontend.design.getdefaultfieldinfo",
      NS_SYSTEM_STRING,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string, prop: string) => {
        const schema = await getSchema(type);
        if (!schema || schema?.type === SchemaType.Scalar) return null;
        if (prop === "display")
          return schema.display?.key ? schema.display : null;
        if (prop === "name") return type.split(".").pop() || type;
        return schema[prop as keyof INodeSchema] as string;
      },
    ),

    newSystemStruct(
      "system.schema.def.struct.field",
      [
        {
          name: "name",
          type: NS_SYSTEM_IDENTIFIER,
          require: true,
          upLimit: 32,
        },
        { name: "type", type: "system.schema.type.rule.value", require: true },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
        { name: "desc", type: NS_SYSTEM_LOCALE_STRING },
        { name: "error", type: NS_SYSTEM_LOCALE_STRING },
        { name: "require", type: NS_SYSTEM_BOOL },
        { name: "immutable", type: NS_SYSTEM_BOOL },
        { name: "readonly", type: NS_SYSTEM_BOOL },
        { name: "invisible", type: NS_SYSTEM_BOOL },
        { name: "displayOnly", type: NS_SYSTEM_BOOL },
        { name: "unit", type: NS_SYSTEM_LOCALE_STRING },
        { name: "default", type: NS_SYSTEM_STRING, asSuggest: true },
        { name: "unpack", type: NS_SYSTEM_BOOL },

        // scalar config
        { name: "whiteList", type: NS_SYSTEM_STRINGS, anyLevel: true },
        { name: "blackList", type: NS_SYSTEM_STRINGS, anyLevel: true },
        { name: "lowLimit", type: NS_SYSTEM_STRING },
        { name: "upLimit", type: NS_SYSTEM_STRING },
        { name: "asSuggest", type: NS_SYSTEM_BOOL },
        { name: "useOriginForUpLimit", type: NS_SYSTEM_BOOL },

        // enum config
        { name: "cascade", type: NS_SYSTEM_INT },
        { name: "root", type: NS_SYSTEM_STRING, anyLevel: true },
        { name: "anyLevel", type: NS_SYSTEM_BOOL },
        { name: "singleFlag", type: NS_SYSTEM_BOOL },
      ],
      [
        // name
        {
          field: "name",
          property: RelationType.Default,
          func: "frontend.design.getdefaultfieldinfo",
          args: [{ name: "type" }, { value: "name" }],
        },

        // display
        {
          field: "display",
          property: RelationType.Default,
          func: "frontend.design.getdefaultfieldinfo",
          args: [{ name: "type" }, { value: "display" }],
        },

        // default
        {
          field: "default",
          property: RelationType.Visible,
          func: "frontend.design.isscalarenumtype",
          args: [{ name: "type" }],
        },
        {
          field: "default",
          property: RelationType.Type,
          func: "frontend.design.getscalarorenumtype",
          args: [{ name: "type" }],
        },
        {
          field: "default",
          property: RelationType.WhiteList,
          func: "system.intrinsic.assign",
          args: [{ name: "whiteList" }],
        },
        {
          field: "default",
          property: RelationType.BlackList,
          func: "system.intrinsic.assign",
          args: [{ name: "blackList" }],
        },
        {
          field: "default",
          property: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "root" }],
        },
        {
          field: "default",
          property: RelationType.AnyLevel,
          func: "system.intrinsic.assign",
          args: [{ name: "anyLevel" }],
        },
        {
          field: "default",
          property: RelationType.Cascade,
          func: "system.intrinsic.assign",
          args: [{ name: "cascade" }],
        },
        {
          field: "default",
          property: RelationType.SingleFlag,
          func: "system.intrinsic.assign",
          args: [{ name: "singleFlag" }],
        },

        // white list
        {
          field: "whiteList",
          property: RelationType.Visible,
          func: "frontend.design.isscalarenumtype",
          args: [{ name: "type" }],
        },
        {
          field: "whiteList",
          property: RelationType.Type,
          func: "frontend.design.getwhiteblacklisttype",
          args: [{ name: "type" }],
        },
        {
          field: "whiteList",
          property: RelationType.BlackList,
          func: "system.intrinsic.assign",
          args: [{ name: "blackList" }],
        },
        {
          field: "whiteList",
          property: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "root" }],
        },
        {
          field: "whiteList",
          property: RelationType.Cascade,
          func: "system.intrinsic.assign",
          args: [{ name: "cascade" }],
        },
        {
          field: "blackList",
          property: RelationType.Visible,
          func: "frontend.design.isscalarenumtype",
          args: [{ name: "type" }],
        },
        {
          field: "blackList",
          property: RelationType.Type,
          func: "frontend.design.getwhiteblacklisttype",
          args: [{ name: "type" }],
        },
        {
          field: "blackList",
          property: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "root" }],
        },
        {
          field: "blackList",
          property: RelationType.Cascade,
          func: "system.intrinsic.assign",
          args: [{ name: "cascade" }],
        },
        {
          field: "lowLimit",
          property: RelationType.Visible,
          func: "frontend.design.isscalartype",
          args: [{ name: "type" }],
        },
        {
          field: "upLimit",
          property: RelationType.Visible,
          func: "frontend.design.isscalartype",
          args: [{ name: "type" }],
        },
        {
          field: "asSuggest",
          property: RelationType.Visible,
          func: "frontend.design.isscalartype",
          args: [{ name: "type" }],
        },
        {
          field: "useOriginForUpLimit",
          property: RelationType.Visible,
          func: "frontend.design.isscalartype",
          args: [{ name: "type" }],
        },
        {
          field: "cascade",
          property: RelationType.Visible,
          func: "frontend.design.iscascadeenumtype",
          args: [{ name: "type" }],
        },
        {
          field: "cascade",
          property: RelationType.WhiteList,
          func: "frontend.design.getenumcascadewhitelist",
          args: [{ name: "type" }],
        },
        {
          field: "root",
          property: RelationType.Visible,
          func: "frontend.design.isenumroot",
          args: [{ name: "type" }, { name: "cascade" }],
        },
        {
          field: "root",
          property: RelationType.Type,
          func: "frontend.design.getroottype",
          args: [{ name: "type" }],
        },
        {
          field: "root",
          property: RelationType.Cascade,
          func: "frontend.design.getenumrootcascade",
          args: [{ name: "type" }, { name: "cascade" }],
        },
        {
          field: "anyLevel",
          property: RelationType.Visible,
          func: "frontend.design.iscascadeenumtype",
          args: [{ name: "type" }],
        },
        {
          field: "singleFlag",
          property: RelationType.Visible,
          func: "frontend.design.isflagsenumtype",
          args: [{ name: "type" }],
        },
        {
          field: "unpack",
          property: RelationType.Visible,
          func: "system.logic.eq",
          args: [{ name: "type" }, { value: NS_SYSTEM_JSON }],
        },
      ],
    ),
    newSystemArray(
      "system.schema.def.struct.fields",
      "system.schema.def.struct.field",
      "name",
    ),

    newSystemFunc(
      "frontend.design.getstructindexfields",
      NS_SYSTEM_STRINGS,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        const schema = type ? await getSchema(type) : null;
        const indexes: string[] = [];

        if (schema?.struct?.fields) {
          for (let i = 0; i < schema.struct.fields.length; i++) {
            if (
              await isStructFieldIndexable(
                schema.struct.fields[i] as IStructFieldSchema,
              )
            ) {
              indexes.push(schema.struct.fields[i].name);
            }
          }
        }
        return indexes;
      },
    ),

    newSystemFunc(
      "frontend.design.getstructnumbervaluefields",
      NS_SYSTEM_STRINGS,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        let schema = type ? await getSchema(type) : null;
        if (schema?.type === SchemaType.Array && schema.array?.element)
          schema = await getSchema(schema.array.element);

        const values: string[] = [];
        if (schema?.struct?.fields) {
          for (let i = 0; i < schema.struct.fields.length; i++) {
            const field = schema!.struct!.fields[i];
            if (await isSchemaCanBeUseAs(field.type, NS_SYSTEM_NUMBER))
              values.push(field.name);
          }
        }
        return values;
      },
    ),

    newSystemFunc(
      "frontend.design.getrelationfuncreturn",
      "system.schema.type.rule.value",
      [
        { name: "fieldType", type: "system.schema.type.rule.value" },
        { name: "relationType", type: "system.schema.def.struct.relationtype" },
      ],
      async (fieldType: string, type: any) => {
        switch (type) {
          case RelationType.Default:
          case RelationType.Assign:
          case RelationType.InitOnly:
          case RelationType.Root:
            return fieldType;

          case RelationType.WhiteList:
          case RelationType.BlackList:
            const arraySchema = await getArraySchema(fieldType);
            return arraySchema?.name || NS_SYSTEM_ARRAY;

          case RelationType.LowLimit:
          case RelationType.UpLimit:
            if (await isSchemaCanBeUseAs(NS_SYSTEM_STRING, fieldType))
              return NS_SYSTEM_INT;
            return fieldType;

          case RelationType.Type:
            return "system.schema.type.rule.value";

          case RelationType.Cascade:
            return NS_SYSTEM_INT;

          case RelationType.Invisible:
          case RelationType.Visible:
          case RelationType.Disable:
          case RelationType.AnyLevel:
          case RelationType.SingleFlag:
          case RelationType.Validation:
            return NS_SYSTEM_BOOL;
          case RelationType.Display:
            return NS_SYSTEM_STRING;
        }
      },
    ),

    newSystemFunc(
      "frontend.design.getrelationwhitelist",
      NS_SYSTEM_STRINGS,
      [{ name: "fieldType", type: NS_SYSTEM_STRING }],
      async (fieldType: string) => {
        if (!fieldType) return [];
        const typeInfo = fieldType ? await getSchema(fieldType) : null;
        if (typeInfo?.type === SchemaType.Scalar) {
          return [
            RelationType.Default,
            RelationType.Root,
            RelationType.WhiteList,
            RelationType.BlackList,
            RelationType.LowLimit,
            RelationType.UpLimit,
            RelationType.Invisible,
            RelationType.Visible,
            RelationType.Disable,
            RelationType.Assign,
            RelationType.InitOnly,
            RelationType.Type,
            RelationType.Display,
            RelationType.Validation,
          ];
        } else if (typeInfo?.type === SchemaType.Enum) {
          return [
            RelationType.Default,
            RelationType.Root,
            RelationType.WhiteList,
            RelationType.BlackList,
            RelationType.Invisible,
            RelationType.Visible,
            RelationType.Disable,
            RelationType.Assign,
            RelationType.InitOnly,
            RelationType.Type,
            RelationType.AnyLevel,
            RelationType.Cascade,
            RelationType.SingleFlag,
            RelationType.Display,
            RelationType.Validation,
          ];
        } else if (typeInfo?.type === SchemaType.Struct) {
          return [
            RelationType.Default,
            RelationType.Invisible,
            RelationType.Visible,
            RelationType.Disable,
            RelationType.Assign,
            RelationType.Type,
            RelationType.Display,
          ];
        }
        return [
          RelationType.Default,
          RelationType.Root,
          RelationType.WhiteList,
          RelationType.BlackList,
          RelationType.Invisible,
          RelationType.Visible,
          RelationType.Disable,
          RelationType.Assign,
          RelationType.InitOnly,
          RelationType.Type,
          RelationType.AnyLevel,
          RelationType.Cascade,
          RelationType.Display,
          RelationType.Validation,
        ];
      },
    ),

    newSystemFunc(
      "frontend.design.getstructfieldtype",
      "system.schema.type.rule.value",
      [
        { name: "field", type: NS_SYSTEM_STRING },
        { name: "fields", type: "system.schema.def.struct.fields" },
      ],
      async (field: string, fields: any[]) => {
        const paths = (field || "").split(".");
        if (paths.length === 0) return null;
        let tarField = (fields || []).find((p) => p.name === paths[0]);
        for (let i = 1; i < paths.length; i++) {
          if (!tarField) return null;

          let schema = await getSchema(tarField.type);
          if (schema?.type === SchemaType.Array && schema.array?.element) {
            schema = await getSchema(schema.array!.element);
          }

          if (paths[i] === ARRAY_ELEMENT) return schema?.name;

          if (schema?.type === SchemaType.Struct && schema.struct?.fields) {
            tarField = schema.struct.fields.find(
              (p: IStructFieldSchema) => p.name === paths[i],
            );
          } else {
            tarField = null;
          }
        }
        return tarField?.type;
      },
    ),

    newSystemFunc(
      "frontend.design.getstructfieldtypebytype",
      "system.schema.type.rule.value",
      [
        { name: "type", type: "system.schema.type.rule.value" },
        { name: "field", type: NS_SYSTEM_STRING },
      ],
      async (type: string, field: string) => {
        const paths = (field || "").split(".");
        if (paths.length === 0) return null;

        let schema = await getSchema(type);
        if (!schema) return null;
        let tarField = schema.struct?.fields.find(
          (p: IStructFieldSchema) => p.name === paths[0],
        );
        for (let i = 1; i < paths.length; i++) {
          if (!tarField) return null;

          schema = await getSchema(tarField.type);
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
      "system.schema.def.struct.relation",
      [
        { name: "field", type: "frontend.design.reltarfield", require: true },
        {
          name: "fieldType",
          type: "system.schema.type.rule.value",
          displayOnly: true,
          invisible: true,
        },
        { name: "prop", type: "system.schema.property", require: true },
        { name: "return", type: "system.schema.type.rule.value", displayOnly: true },
        { name: "func", type: "system.schema.type.func", require: true },
        { name: "args", type: "frontend.design.structfldfuncargs" },
      ],
      [
        {
          field: "return",
          prop: RelationType.Visible,
          func: "system.logic.notempty",
          args: [{ name: "prop" }],
        },
        {
          field: "prop",
          prop: RelationType.WhiteList,
          func: "frontend.design.getrelationwhitelist",
          args: [{ name: "fieldType" }],
        },
        {
          field: "return",
          prop: RelationType.Default,
          func: "frontend.design.getrelationfuncreturn",
          args: [{ name: "fieldType" }, { name: "prop" }],
        },
        {
          field: "func",
          prop: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "return" }],
        },
      ],
    ),
    newSystemArray(
      "system.schema.def.struct.relations",
      "system.schema.def.struct.relation",
      "field",
      "prop",
    ),

    newSystemStruct(
      "system.schema.def.struct.schema",
      [
        { name: "base", type: "system.schema.type.struct" },
        {
          name: "fields",
          type: "system.schema.def.struct.fields",
          require: true,
        },
        { name: "relations", type: "system.schema.def.struct.relations" },
      ],
      [
        {
          field: "relations.fieldType",
          property: RelationType.Default,
          func: "frontend.design.getstructfieldtype",
          args: [{ name: "relations.field" }, { name: "fields" }],
        },
      ],
    ),
    //#endregion

    //#region array definition
    newSystemFunc(
      "frontend.design.isstructtype",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value", nullable: true }],
      async (type: string) => {
        if (!type) return true;
        const schema = await getSchema(type);
        return schema?.type === SchemaType.Struct;
      },
    ),

    newSystemFunc(
      "frontend.design.isstructorstructarray",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value", nullable: true }],
      async (type: string) => {
        if (!type) return false;
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array)
          schema = schema.array?.element
            ? await getSchema(schema.array.element)
            : undefined;
        return schema?.type === SchemaType.Struct;
      },
    ),

    newSystemFunc(
      "frontend.design.isstructarray",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value", nullable: true }],
      async (type: string) => {
        if (!type) return false;
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array)
          schema = schema.array?.element
            ? await getSchema(schema.array.element)
            : undefined;
        else return false;
        return schema?.type === SchemaType.Struct;
      },
    ),

    newSystemFunc(
      "frontend.design.notstructarraytype",
      NS_SYSTEM_BOOL,
      [{ name: "type", type: "system.schema.type.rule.value", nullable: true }],
      async (type: string) => {
        if (!type) return true;
        let schema = await getSchema(type);
        if (schema?.type === SchemaType.Array)
          schema = schema.array?.element
            ? await getSchema(schema.array.element)
            : undefined;
        return schema?.type !== SchemaType.Struct;
      },
    ),

    newSystemStruct("system.schema.def.array.datacombine", [
      { name: "field", type: NS_SYSTEM_STRING },
      { name: "type", type: "system.schema.def.array.datacombinetype" },
    ]),
    newSystemArray(
      "system.schema.def.array.datacombines",
      "system.schema.def.array.datacombine",
      "field",
    ),

    newSystemStruct(
      "system.schema.def.array.dataindex",
      [
        { name: "name", type: NS_SYSTEM_STRING, upLimit: 16 },
        { name: "fields", type: NS_SYSTEM_STRINGS },
      ],
      [
        {
          field: "fields.$ele",
          property: RelationType.BlackList,
          func: "system.intrinsic.assign",
          args: [{ name: "fields" }],
        },
      ],
    ),
    newSystemArray(
      "frontend.design.dataindexes",
      "system.schema.def.array.dataindex",
      "name",
    ),

    newSystemStruct(
      "system.schema.def.array.schema",
      [
        { name: "element", type: "system.schema.type.rule.arrayelement" },
        { name: "single", type: NS_SYSTEM_BOOL },
        { name: "primary", type: NS_SYSTEM_STRINGS },
        { name: "indexes", type: "frontend.design.dataindexes" },
        { name: "combines", type: "system.schema.def.array.datacombines" },
        { name: "relations", type: "system.schema.def.struct.relations" },
      ],
      [
        {
          field: "primary",
          property: RelationType.Visible,
          func: "frontend.design.isstructtype",
          args: [{ name: "element" }],
        },
        {
          field: "primary.$ele",
          property: RelationType.WhiteList,
          func: "frontend.design.getstructindexfields",
          args: [{ name: "element" }],
        },
        {
          field: "primary.$ele",
          property: RelationType.BlackList,
          func: "system.intrinsic.assign",
          args: [{ name: "primary" }],
        },
        {
          field: "indexes",
          property: RelationType.Visible,
          func: "frontend.design.isstructtype",
          args: [{ name: "element" }],
        },
        {
          field: "indexes.fields.$ele",
          property: RelationType.WhiteList,
          func: "frontend.design.getstructindexfields",
          args: [{ name: "element" }],
        },
        {
          field: "combines",
          property: RelationType.Visible,
          func: "frontend.design.isstructtype",
          args: [{ name: "element" }],
        },
        {
          field: "combines.field",
          property: RelationType.WhiteList,
          func: "frontend.design.getstructnumbervaluefields",
          args: [{ name: "element" }],
        },
        {
          field: "relations.fieldType",
          property: RelationType.Default,
          func: "frontend.design.getstructfieldtypebytype",
          args: [{ name: "element" }, { name: "relations.field" }],
        },
      ],
    ),
    //#endregion

    //#region function definition
    newSystemFunc(
      "frontend.design.gettypedisplayorname",
      NS_SYSTEM_STRING,
      [{ name: "type", type: "system.schema.type.rule.value" }],
      async (type: string) => {
        const schema = type ? await getSchema(type) : null;
        if (!schema) return null;
        return schema.display?.key
          ? _L(schema.display)
          : schema.name.split(".").pop();
      },
    ),

    newSystemStruct(
      "system.schema.def.func.arg",
      [
        { name: "name", require: true, type: NS_SYSTEM_STRING, upLimit: 32 },
        { name: "type", require: true, type: "system.schema.type.rule.value" },
        { name: "nullable", type: NS_SYSTEM_BOOL },
        { name: "display", type: NS_SYSTEM_LOCALE_STRING },
      ],
      [
        {
          field: "name",
          property: RelationType.Default,
          func: "frontend.design.gettypedisplayorname",
          args: [{ name: "type" }],
        },
      ],
    ),
    newSystemArray("system.schema.def.func.args", "system.schema.def.func.arg", "name"),

    newSystemStruct(
      "system.schema.def.func.callarg",
      [
        { name: "display", type: NS_SYSTEM_STRING, displayOnly: true },
        { name: "type", type: "system.schema.type.rule.value", readonly: true },
        { name: "name", type: NS_SYSTEM_STRING, upLimit: 32 },
        { name: "value", type: NS_SYSTEM_OBJECT, anyLevel: true },
      ],
      [
        {
          field: "name",
          property: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ name: "type" }],
        },
        {
          field: "name",
          property: RelationType.Disable,
          func: "system.logic.notempty",
          args: [{ name: "value" }],
        },
        {
          field: "value",
          property: RelationType.Type,
          func: "frontend.design.getexpvaluetype",
          args: [{ name: "type" }],
        },
        {
          field: "value",
          property: RelationType.Disable,
          func: "frontend.design.hideexpvalue",
          args: [{ name: "type" }, { name: "name" }],
        },
      ],
    ),
    newSystemArray("system.schema.def.func.callargs", "system.schema.def.func.callarg"),

    newSystemFunc(
      "frontend.design.getcalltypewhitelist",
      NS_SYSTEM_ARRAY,
      [{ name: "return", type: "system.schema.type.rule.value" }],
      async (ret: string) => {
        const schema = ret ? await getSchema(ret) : null;
        if (schema?.type === SchemaType.Array) {
          return [
            ExpressionType.Call,
            ExpressionType.Filter,
            ExpressionType.Map,
          ];
        } else if (await isSchemaCanBeUseAs(ret, NS_SYSTEM_BOOL)) {
          return [ExpressionType.Call, ExpressionType.All, ExpressionType.Any];
        } else if (await isSchemaCanBeUseAs(ret, NS_SYSTEM_INT)) {
          return [
            ExpressionType.Call,
            ExpressionType.Count,
            ExpressionType.Reduce,
          ];
        }
        return [
          ExpressionType.Call,
          ExpressionType.First,
          ExpressionType.Last,
          ExpressionType.Reduce,
        ];
      },
    ),

    newSystemFunc(
      "frontend.design.getfuncroot",
      "system.schema.type.rule.value",
      [
        { name: "return", type: "system.schema.type.rule.value" },
        { name: "type", type: "system.schema.def.func.exptype" },
      ],
      async (ret: string, type: ExpressionType) => {
        switch (type) {
          case ExpressionType.Call:
          case ExpressionType.Reduce:
            return ret;

          case ExpressionType.Map:
            const schema = ret ? await getSchema(ret) : null;
            return schema?.array?.element;

          case ExpressionType.Filter:
          case ExpressionType.First:
          case ExpressionType.Last:
          case ExpressionType.Count:
          case ExpressionType.All:
          case ExpressionType.Any:
            return NS_SYSTEM_BOOL;
        }
      },
    ),

    newSystemStruct(
      "system.schema.def.func.exp",
      [
        { name: "name", type: NS_SYSTEM_STRING, require: true, upLimit: 32 },
        { name: "return", type: "system.schema.type.rule.value", require: true },
        {
          name: "type",
          type: "system.schema.def.func.exptype",
          require: true,
          default: ExpressionType.Call,
        },
        { name: "func", type: "system.schema.type.func", require: true },
        { name: "args", type: "system.schema.def.func.callargs", require: true },
      ],
      [
        {
          field: "type",
          property: RelationType.WhiteList,
          func: "frontend.design.getcalltypewhitelist",
          args: [{ name: "return" }],
        },
        {
          field: "func",
          property: RelationType.Root,
          func: "frontend.design.getfuncroot",
          args: [{ name: "return" }, { name: "type" }],
        },
      ],
    ),
    newSystemArray("system.schema.def.func.exps", "system.schema.def.func.exp", "name"),

    newSystemStruct("system.schema.def.func.schema", [
      {
        name: "return",
        type: "system.schema.type.rule.value",
        require: true,
        immutable: true,
      },
      { name: "args", type: "system.schema.def.func.args", require: true },
      { name: "exps", type: "system.schema.def.func.exps", require: true },
      { name: "generic", type: NS_SYSTEM_STRINGS, invisible: true },
      { name: "server", type: NS_SYSTEM_BOOL },
      { name: "nocache", type: NS_SYSTEM_BOOL },
    ]),
    //#endregion

    //#region event definition
    newSystemStruct("system.schema.def.event.schema", [
      { name: "payload", type: "system.schema.type.rule.value", readonly: true },
    ]),
    //#endregion

    //#region workflow definition
    newSystemStruct("system.schema.def.app.workflow.schema", [
      {
        name: "mode",
        type: "system.workflow.mode",
        require: true,
        readonly: true,
      },
      { name: "payload", type: "system.schema.type.rule.value", readonly: true },
      { name: "state", type: "system.schema.type.rule.value", readonly: true },
      { name: "session", type: "system.schema.type.rule.value", readonly: true },
      { name: "args", type: "system.schema.def.func.args", readonly: true },
    ]),
    //#endregion

    //#region recognizer definition
    newSystemEnum("system.schema.def.recognizer.parttype", RecognizerPartType),

    newSystemStruct(
      "system.schema.def.recognizer.format",
      [
        { name: "minDigits", type: NS_SYSTEM_INT },
        { name: "maxDigits", type: NS_SYSTEM_INT },
        { name: "precision", type: NS_SYSTEM_INT },
        { name: "padChar", type: NS_SYSTEM_STRING, upLimit: 1 },
        { name: "padLeft", type: NS_SYSTEM_BOOL },
        { name: "trim", type: NS_SYSTEM_BOOL },
        { name: "toUpper", type: NS_SYSTEM_BOOL },
        { name: "toLower", type: NS_SYSTEM_BOOL },
        { name: "layout", type: NS_SYSTEM_STRING, upLimit: 64 },
        { name: "mapping", type: NS_SYSTEM_ENTRIES },
        { name: "formatFunc", type: "system.schema.type.func" },
        { name: "parseFunc", type: "system.schema.type.func" },
      ],
    ),

    newSystemStruct(
      "system.schema.def.recognizer.part",
      [
        {
          name: "type",
          type: "system.schema.def.recognizer.parttype",
          require: true,
          default: RecognizerPartType.Field,
        },
        { name: "text", type: NS_SYSTEM_STRING, upLimit: 128 },
        { name: "field", type: NS_SYSTEM_STRING, upLimit: 64 },
        { name: "delimiter", type: NS_SYSTEM_STRING, upLimit: 32 },
        { name: "recognizer", type: "system.schema.type.recognizer" },
        { name: "format", type: "system.schema.def.recognizer.format" },
      ],
      [
        {
          field: "text",
          property: RelationType.Visible,
          func: "system.logic.eq",
          args: [{ name: "type" }, { value: RecognizerPartType.Literal }],
        },
        {
          field: "field",
          property: RelationType.Visible,
          func: "system.logic.eq",
          args: [{ name: "type" }, { value: RecognizerPartType.Field }],
        },
        {
          field: "delimiter",
          property: RelationType.Visible,
          func: "system.logic.eq",
          args: [{ name: "type" }, { value: RecognizerPartType.Elements }],
        },
      ],
    ),
    newSystemArray(
      "system.schema.def.recognizer.parts",
      "system.schema.def.recognizer.part",
    ),

    newSystemStruct("system.schema.def.recognizer.schema", [
      {
        name: "sourceType",
        type: "system.schema.type.rule.value",
        require: true,
        immutable: true,
      },
      { name: "parts", type: "system.schema.def.recognizer.parts", require: true },
    ]),
    //#endregion

    //#region policy definition
    newSystemStruct(
      "system.schema.def.policy.item",
      [
        { name: "scope", type: "system.schema.def.policy.scope", require: true },
        {
          name: "combine",
          type: "system.schema.def.policy.combine",
          require: true,
          default: PolicyCombine.OrElse,
        },
        {
          name: "evaluator",
          type: "system.schema.type.rule.evaluator",
          require: true,
        },
      ],
      [
        {
          field: "evaluator",
          property: RelationType.Root,
          func: "system.intrinsic.assign",
          args: [{ value: NS_SYSTEM_BOOL }],
        },
      ],
    ),
    newSystemArray(
      "system.schema.def.policy.items",
      "system.schema.def.policy.item",
      "scope",
    ),

    newSystemStruct(
      "system.schema.def.policy.schema",
      [{ name: "items", type: "system.schema.def.policy.items", require: true }],
      [
        {
          field: "items.scope",
          property: RelationType.WhiteList,
          func: "frontend.design.getappschemapolicyscope",
          args: [],
        },
        {
          field: "items.scope",
          property: RelationType.BlackList,
          func: "system.collection.getfields",
          args: [{ name: "items" }, { value: "scope" }],
        },
      ],
    ),

    newSystemFunc(
      "frontend.design.getschemapolicyscope",
      "system.schema.def.policy.scopes",
      [],
      () => {
        return [
          PolicyScope.SchemaCreate,
          PolicyScope.SchemaUpdate,
          PolicyScope.SchemaDelete,
          PolicyScope.SchemaRead,
          PolicyScope.FuncExecute,
        ];
      },
    ),

    newSystemFunc(
      "frontend.design.getappschemapolicyscope",
      "system.schema.def.policy.scopes",
      [],
      () => {
        return [
          PolicyScope.SchemaCreate,
          PolicyScope.SchemaUpdate,
          PolicyScope.SchemaDelete,
          PolicyScope.SchemaRead,
          PolicyScope.FuncExecute,
          PolicyScope.DataCreate,
          PolicyScope.DataRead,
          PolicyScope.DataUpdate,
          PolicyScope.DataDelete,
        ];
      },
    ),

    newSystemFunc(
      "frontend.design.getrowpolicyscope",
      "system.schema.def.policy.scopes",
      [],
      () => {
        return [
          PolicyScope.DataCreate,
          PolicyScope.DataRead,
          PolicyScope.DataUpdate,
          PolicyScope.DataDelete,
        ];
      },
    ),
    //#endregion
  ],
  SchemaLoadState.System,
);

//#region Schema storage

// reload schemas from storage
export function reloadStorageSchemas() {
  const namelist = localStorage["schema_custom_namelist"];
  const list = namelist ? JSON.parse(namelist) : null;
  if (!list || !Array.isArray(list)) return;

  const schemas: INodeSchema[] = [];
  for (let i = 0; i < list.length; i++) {
    const data = localStorage[`schema_data_${list[i]}`];
    const schema = data ? JSON.parse(data) : null;
    if (!schema || typeof schema !== "object") continue;
    schemas.push(schema);
  }
  registerSchema(schemas, SchemaLoadState.Custom);
}

// save schema to storage
export function saveStorageSchema(schema: INodeSchema) {
  // only save custom schema in the cache
  if (schema.loadState && (schema.loadState & SchemaLoadState.Custom) == 0)
    return;

  // update name list
  const namelist = localStorage["schema_custom_namelist"];
  let list: string[] = namelist ? JSON.parse(namelist) : [];
  const name = schema.name.toLowerCase();
  if (!Array.isArray(list)) list = [];
  if (!list.includes(name)) {
    list.push(name);
    list.sort();
    localStorage["schema_custom_namelist"] = JSON.stringify(list);
  }

  // save schema
  localStorage[`schema_data_${name}`] = JSON.stringify({
    name: schema.name,
    type: schema.type,
    desc: schema.display,
    scalar: schema.scalar,
    enum: schema.enum,
    struct: schema.struct,
    array: schema.array,
    func: schema.func,
  });
}

// delete schema from storage
export function removeStorageSchema(name: string | INodeSchema) {
  name = (typeof name === "object" ? name.name : name).toLowerCase();
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
  const schema = getCachedSchema(root);
  schema?.schemas?.forEach((s: INodeSchema) => {
    if ((s.loadState || 0) & SchemaLoadState.Custom) {
      saveStorageSchema(s);
      if (s.type === SchemaType.Namespace) {
        saveAllCustomSchemaToStroage(s.name);
      }
    }
  });
}

// export schema
export function schemaToJson(f: INodeSchema): INodeSchema {
  const r: INodeSchema = {
    name: f.name,
    type: f.type,
    display: deepClone(f.display),
    auth: f.auth,
  };

  switch (f.type) {
    case SchemaType.Namespace:
      r.schemas = f.schemas
        ?.filter(
          (f: INodeSchema) =>
            f.type === SchemaType.Namespace ||
            !((f.loadState || 0) & SchemaLoadState.System),
        )
        .map(schemaToJson)
        .filter(
          (f: INodeSchema) =>
            f.type !== SchemaType.Namespace || f.schemas?.length,
        );
      break;

    case SchemaType.Scalar:
      r.scalar = deepClone(f.scalar, true);
      break;

    case SchemaType.Enum:
      r.enum = deepClone(f.enum, true);
      break;

    case SchemaType.Struct:
      r.struct = deepClone(f.struct, true);
      if (r.struct?.relations) {
        r.struct.relations.forEach((r: IStructRelationSchema) => {
          const funcInfo = getCachedSchema(r.func);
          const args = funcInfo?.func?.args || [];
          if (!args.length || !args[args.length - 1].params) return;

          // clear empty args
          while (
            r.args &&
            r.args.length > args.length &&
            isNull(r.args[r.args.length - 1].value) &&
            isNull(r.args[r.args.length - 1].name)
          ) {
            r.args.pop();
          }
        });
      }
      break;

    case SchemaType.Array:
      r.array = deepClone(f.array, true);
      break;

    case SchemaType.Func:
      r.func = { ...deepClone(f.func!, true), func: undefined };
      if (!r.func!.exps) r.func!.exps = [];
      if (!r.func!.args) r.func!.args = [];
      // clear empty params exps
      r.func?.exps.forEach((exp: IFunctionExpression) => {
        const funcInfo = getCachedSchema(exp.func);
        const args = funcInfo?.func?.args || [];
        if (!args.length || !args[args.length - 1].params) return;

        while (
          exp.args.length > args.length &&
          isNull(exp.args[exp.args.length - 1].value) &&
          isNull(exp.args[exp.args.length - 1].name)
        ) {
          exp.args.pop();
        }
      });
      break;

    case SchemaType.Policy:
      r.policy = deepClone(f.policy, true);
      break;
  }
  return r;
}

//#endregion

//#region  View

import namespaceView from "./view/namespaceView.vue";
import namespaceInputView from "./view/namespaceInputView.vue";
import enumvalueinfosView from "./view/enumvalueinfosView.vue";
import structfieldtypesView from "./view/structfieldtypesView.vue";
import structfldrelationinfosView from "./view/structfldrelationinfosView.vue";
import reltarfieldView from "./view/reltarfieldView.vue";
import structfldfuncargsView from "./view/structfldfuncargsView.vue";
import funcdefineView from "./view/funcdefineView.vue";
import { regSchemaTypeView } from "schema-node-vueview";

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
