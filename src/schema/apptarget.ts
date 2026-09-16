import { AppScopeType, NS_SYSTEM_SCHEMA_APP, NS_SYSTEM_SCHEMA_REFLECT_APP } from "schema-node-app";
import { ArgName, AsSuggest, buildFuncCall, Call, InVisible, isNull, Meta, NS_SYSTEM_INTRINSIC, NS_SYSTEM_LIST, NS_SYSTEM_STRING, OfSchema, Relation, Require, Return, SCHEMA_KIND_FUNCTION, SchemaType, UpLimitString, WhiteList } from "schema-node-core";

@Meta(SchemaType, 'frontend.apptarget')
class AppTargetMeta {
  /** The allowed applications */
  @Meta(SchemaType, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
  @Meta(InVisible, true)
  allowApps?: string[];

  /** The application name */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_APP}.type`)
  @Meta(Require, true)
  @Relation(WhiteList, Call, buildFuncCall(`${NS_SYSTEM_INTRINSIC}.assign`, '@allowApps'))
  app!: string;

  /** The application target */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(UpLimitString, 64)
  @Meta(Require, true)
  @Meta(AsSuggest, true)
  @Relation(InVisible, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_REFLECT_APP}.isscopepolicy`, '@app', AppScopeType.SystemLevel))
  @Relation(WhiteList, Call, buildFuncCall(`frontend.method.getapptargets`, '@app'))
  target!: string;
}

@Meta(SchemaType, 'frontend.method')
@Meta(OfSchema, SCHEMA_KIND_FUNCTION)
class FrontendMethods {
  /** Get the application targets */
  @Meta(Return, `${NS_SYSTEM_LIST}<${NS_SYSTEM_STRING}>`)
  static getapptargets(
    @Meta(ArgName, "app")
    @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_APP}.type`)
    app: string) {
    if (isNull(app)) return [];
    const appTargets = JSON.parse(
      localStorage["schema_app_targets"] || "{}",
    );
    if (appTargets && typeof appTargets === "object")
      return appTargets[app] || [];
    return [];
  }
}