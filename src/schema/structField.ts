import { Alias, buildFuncCall, Call, ForSchema, Meta, NS_SYSTEM_OBJECT, NS_SYSTEM_SCHEMA_DESIGN, NS_SYSTEM_SCHEMA_REFLECT_ARRAY, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_STRUCT_FIELD, OverrideType, Property, PropertyValueType, Relation, SCHEMA_KIND_ARRAY, SchemaType, Unpack, Visible } from "schema-node-core";

/** The holder of the array kind properties for struct field */
@Meta(Alias, "arrayDesign")
@Meta(ForSchema, [NS_SYSTEM_SCHEMA_STRUCT_FIELD])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT_FIELD}.ArrayDesign`)
@Meta(Unpack, true)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_DESIGN}.array`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, "@type", false, SCHEMA_KIND_ARRAY))
export class StructFieldArrayDesign extends Property<unknown> {}

/** The holder of the value kind properties for struct field */
@Meta(Alias, "valueDesign")
@Meta(ForSchema, [NS_SYSTEM_SCHEMA_STRUCT_FIELD])
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT_FIELD}.ValueDesign`)
@Meta(Unpack, true)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_ARRAY}.getarrayelement`, "@type"))
export class StructFieldValueDesign extends Property<unknown> {}