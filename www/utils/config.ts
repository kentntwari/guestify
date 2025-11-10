import type { FetchOptions } from "ofetch";
import type { CreateEventDTO } from "_mapper/event";
import type { IUnkeyCreateKeyDTO } from "_mapper/secrets.unkey";

import { WebhookClerkMapper } from "_mapper/webhook.clerk";

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

  static createUnkeyOpts(data: IUnkeyCreateKeyDTO, opts: IOpts) {
    return {
      ...opts,
      method: "POST",
      body: { ...data },
    };
  }

  static createUserOpts(
    user: ReturnType<(typeof WebhookClerkMapper)["toCreateUser"]>,
    opts: IOpts
  ) {
    return {
      ...opts,
      method: "POST",
      query: { ...user },
    };
  }

  static updateClerkUserMetadataOpts(
    user: ReturnType<(typeof WebhookClerkMapper)["toUpdateUserMetadata"]>,
    opts: IOpts
  ) {
    return {
      ...opts,
      method: "PATCH",
      body: { ...user },
    };
  }

  static createEventOpts(data: CreateEventDTO, opts: IOpts) {
    return {
      ...opts,
      method: "POST",
      body: { ...data },
    };
  }
}
