import { Meta, NS_SYSTEM_BOOL, NS_SYSTEM_STRING, PRIMARY_KEY_MAX_LEN, PrimaryIndex, Require, SchemaType, UpLimitString } from "schema-node-core"

/** The frontend header */
export interface FrontendHeader {
  key: string;
  value: string;
}

/** The frontend auth */
export interface FrontendAuth {
  savestorage: boolean;
  headers: FrontendHeader[];
}

/** The frontend header */
@Meta(SchemaType, 'frontend.header')
class FrontendHeaderMeta implements FrontendHeader {
  /** The header key */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(UpLimitString, PRIMARY_KEY_MAX_LEN)
  @Meta(Require, true)
  @Meta(PrimaryIndex, 0)
  key: string = '';

  /** The header value */
  @Meta(SchemaType, NS_SYSTEM_STRING)
  @Meta(Require, true)
  value: string = '';
}

/** The frontend auth */
@Meta(SchemaType, 'frontend.auth')
class AuthMeta implements FrontendAuth {
  /** Whether to save the auth headers to storage */
  @Meta(SchemaType, NS_SYSTEM_BOOL)
  savestorage: boolean = false;

  /** The auth headers */
  @Meta(SchemaType, 'frontend.headers')
  headers: FrontendHeader[] = [];
}
