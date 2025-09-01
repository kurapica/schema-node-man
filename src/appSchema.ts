import { _LS, NS_SYSTEM_STRING, registerSchema, SchemaLoadState, SchemaType } from "schema-node";

registerSchema([
    {
        name: "schema.app",
        type: SchemaType.Namespace,
        desc: _LS("schema.app")
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
                    display: _LS("schema.app.fieldaccess")
                },
                {
                    name: "access",
                    type: "schema.app.fieldaccess",
                    display: _LS("schema.app.fieldaccess")
                },
                {
                    name: "type",
                    require: true,
                    type: "schema.relationtype",
                    display: _LS("schema.structfldrelationinfo.type"),
                },
                {
                    name: "func",
                    require: true,
                    type: "schema.functype",
                    display: _LS("schema.fieldrelation.func"),
                },
                {
                    name: "args",
                    type: "schema.app.fieldvalargs",
                    display: _LS("schema.fieldrelation.args"),
                },
            ]
        }
    },
    {
        name: "schema.app.fieldrelations",
        type: SchemaType.Array,
        desc: _LS("schema.app.fieldrelations"),
        array: {
            element: "schema.app.fieldrelation"
        }
    },
], SchemaLoadState.System)