import { AppScopeType, NS_SYSTEM_SCHEMA_APP } from "schema-node-app";
import { ArgName, AsSuggest, buildFuncCall, Call, InVisible, isNull, Meta, NS_SYSTEM_INTRINSIC, NS_SYSTEM_LIST, NS_SYSTEM_STRING, Relation, Require, SchemaType, UpLimitString, WhiteList } from "schema-node-core";

@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_APP}.frontend.apptarget`)
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
  @Relation(InVisible, Call, buildFuncCall(`${NS_SYSTEM_SCHEMA_APP}.isscopepolicy`, '@app', AppScopeType.SystemLevel))
  target!: string;
}

@Meta(SchemaType, `${NS_SYSTEM_SCHEMA_APP}.frontend.method`)
class FrontendMethods {
  /** Get the application targets */
  @Meta(SchemaType, `${NS_SYSTEM_SCHEMA_APP}.frontend.method.getapptargets`)
  static appgetapptargets(
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