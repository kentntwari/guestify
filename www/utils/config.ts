import type { FetchOptions } from "ofetch";
import type { UserEntity } from "entities/user";

import { WebhookClerkDTO } from "dto/webhook.clerk";
import type { TUnkeyCreateKeyRequestOptions } from "./schemas.zod";

type BaseHeaders = {
  Authorization: `Bearer ${string}`;
  "Content-Type": "application/json";
};

interface IOpts extends FetchOptions<"json"> {}

export class ConfigUtils {
  constructor(private _token: string) {}

  static baseHeaders(context: ConfigUtils): BaseHeaders {
    return {
      Authorization: `Bearer ${context._token}`,
      "Content-Type": "application/json",
    };
  }

  static createUnkeyOpts(data: TUnkeyCreateKeyRequestOptions, opts: IOpts) {
    return {
      ...opts,
      method: "POST",
      body: { ...data },
    };
  }

  static createUserOpts(user: UserEntity, opts: IOpts) {
    return {
      ...opts,
      method: "POST",
      query: WebhookClerkDTO.createNewUserQuery(user),
    };
  }
}
