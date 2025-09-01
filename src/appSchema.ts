import { _LS, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, registerSchema, SchemaLoadState, SchemaType, type IStructScalarFieldConfig } from "schema-node";

registerSchema([
    {
        name: "schema.app",
        type: SchemaType.Namespace,
        desc: _LS("schema.app")
    },
    {
        name: "schema.app.srcapp",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.srcapp"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "schema.app.fieldaccess",
        type: SchemaType.Scalar,
        desc: _LS("schema.app.fieldaccess"),
        scalar: {
            base: NS_SYSTEM_STRING
        }
    },
    {
        name: "schema.app.fieldaccesses",
        type: SchemaType.Array,
        desc: _LS("schema.app.fieldaccesses"),
        array: {
            element: "schema.app.fieldaccess"
        }
    },
    {
        name: "schema.app.fieldvalarg",
        type: SchemaType.Struct,
        desc: _LS("schema.app.fieldvalarg"),
        struct: {
            fields: [
                {
                    name: "name",
                    type: "schema.app.fieldaccess",
                    display: _LS("schema.app.fieldvalarg.name")
                },
                {
                    name: "value",
                    type: "schema.anyvalue",
                    display: _LS("schema.app.fieldvalarg.value")
                },
            ]
        }
    },
    {
        name: "schema.app.fieldvalargs",
        type: SchemaType.Array,
        desc: _LS("schema.app.fieldvalargs"),
        array: {
            element: "schema.app.fieldvalarg"
        }
    },
    {
        name: "schema.app.fieldrelation",
        type: SchemaType.Struct,
        desc: _LS("schema.app.fieldrelation"),
        struct: {
            fields: [
                {
                    name: "field",
                    require: true,
                    type: "schema.app.fieldaccess",
                    display: _LS("schema.app.fieldrelation.field")
                },
                {
                    name: "type",
                    require: true,
                    type: "schema.relationtype",
                    display: _LS("schema.app.fieldrelation.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "schema.functype",
                    display: _LS("schema.app.fieldrelation.func"),
                },
                {
                    name: "args",
                    type: "schema.app.fieldvalargs",
                    display: _LS("schema.app.fieldrelation.args"),
                },
            ]
        }
    },
    {
        name: "schema.app.fieldrelations",
        type: SchemaType.Array,
        desc: _LS("schema.app.fieldrelations"),
        array: {
            element: "schema.app.fieldrelation",
            primary: [ "field", "type" ]
        }
    },
    {
        name: "schema.app.field",
        type: SchemaType.Struct,
        desc: _LS("schema.app.field"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "schema.varname",
                    display: _LS("schema.app.field.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "type",
                    require: true,
                    type: "schema.valuetype",
                    display: _LS("schema.app.field.type"),
                },
                {
                    name: "display",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.field.display"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.field.desc"),
                    upLimit: 255,
                } as IStructScalarFieldConfig,
                {
                    name: "sourceApp",
                    type: "schema.app.srcapp",
                    display: _LS("schema.app.field.sourceapp"),
                },
                {
                    name: "sourceField",
                    type: "schema.app.fieldaccess",
                    display: _LS("schema.app.field.sourcefld"),
                },
                {
                    name: "func",
                    type: "schema.functype",
                    display: _LS("schema.app.field.sourcefld"),
                },
                {
                    name: "args",
                    type: "schema.app.fieldaccesses",
                    display: _LS("schema.app.field.sourcefld"),
                },
                {
                    name: "incrUpdate",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.incrupdate"),
                },
                {
                    name: "frontEnd",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.frontend"),
                },
                {
                    name: "disable",
                    type: NS_SYSTEM_BOOL,
                    display: _LS("schema.app.field.disable"),
                },
            ]
        }
    },
    {
        name: "schema.app.app",
        type: SchemaType.Struct,
        desc: _LS("schema.app.app"),
        struct: {
            fields: [
                {
                    name: "name",
                    require: true,
                    type: "schema.varname",
                    display: _LS("schema.app.app.name"),
                    upLimit: 32,
                } as IStructScalarFieldConfig,
                {
                    name: "display",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.app.display"),
                    upLimit: 64,
                } as IStructScalarFieldConfig,
                {
                    name: "desc",
                    type: NS_SYSTEM_STRING,
                    display: _LS("schema.app.app.desc"),
                    upLimit: 255,
                } as IStructScalarFieldConfig,
                {
                    name: "relations",
                    type: "schema.app.fieldrelations",
                    display: _LS("schema.app.app.relations"),
                },
            ]
        }
    }
], SchemaLoadState.System)