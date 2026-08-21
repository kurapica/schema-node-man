import { Alias, buildFuncCall, Call, ForSchema, Meta, NS_SYSTEM_OBJECT, NS_SYSTEM_SCHEMA_DESIGN, NS_SYSTEM_SCHEMA_STRUCT, NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, NS_SYSTEM_SCHEMA_REFLECT_TYPE, NS_SYSTEM_SCHEMA_STRUCT_FIELD, OfSchema, OverrideType, Property, PropertyValueType, Relation, SCHEMA_KIND_ARRAY, SCHEMA_KIND_PROPERTY, SchemaType, Unpack, Visible, SCHEMA_KIND_STRUCT_FIELD, NS_SYSTEM_SCHEMA_REFLECT_IS_VALUE_KIND, NS_SYSTEM_LOGIC } from "schema-node-core";

/** The holder of the array kind properties for struct field */
@Meta(Alias, "arrayDesign")
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.arraydesign`)
@Meta(Unpack, true)
@Meta(PropertyValueType, `${NS_SYSTEM_SCHEMA_DESIGN}.array`)
@Relation(Visible, Call, buildFuncCall(NS_SYSTEM_SCHEMA_REFLECT_IS_SCHEMA_KIND, "@type", false, SCHEMA_KIND_ARRAY))
export class StructFieldArrayDesign extends Property<unknown> {}

/** The holder of the value kind properties for struct field */
@Meta(Alias, "valueDesign")
@Meta(ForSchema, [SCHEMA_KIND_STRUCT_FIELD])
@Meta(OfSchema, SCHEMA_KIND_PROPERTY)
@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_STRUCT}.valuedesign`)
@Meta(Unpack, true)
@Meta(PropertyValueType, NS_SYSTEM_OBJECT)
@Relation(OverrideType, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_TYPE}.getdesignschema`, "@type", true))
@Relation(Visible, Call, buildFuncCall(`${NS_SYSTEM_LOGIC}.notempty`, "@type"))
export class StructFieldValueDesign extends Property<unknown> {}