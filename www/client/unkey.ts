import type { $Fetch } from "ofetch";

import { z } from "zod";
import { ofetch as $fetch } from "ofetch";

import { Base } from "client/_base";
import { ApplicationError } from "errors/application";
import { NetworkError } from "errors/network";

import {
  UnkeyErrorResponseSchema,
  UnkeyCreateKeyResponseSchema,
  UnkeyCreateKeyRequestOptionsSchema,
} from "utils/schemas.zod";

type TUnkeySecretsControllerAction =
  | "CREATE_KEY"
  | "DELETE_KEY"
  | "UPDATE_KEY"
  | "GET_KEY";

type TCreateKeyOpts = z.infer<typeof UnkeyCreateKeyRequestOptionsSchema>;
type TCreateKeyResult = z.infer<typeof UnkeyCreateKeyResponseSchema>;
type TErrorResult = z.infer<typeof UnkeyErrorResponseSchema>;

export class UnkeyApiClient extends Base {
  private _unkeyRootToken: string = process.env.UNKEY_ROOT_KEY || "";
  private _unkeyUrlParams: string = "";
  protected _httpClient: $Fetch = $fetch;
  protected _baseHeaders: HeadersInit;
  protected _baseUrl: string = "https://api.unkey.dev/v1";

  constructor(action: TUnkeySecretsControllerAction) {
    super();

    if (!process.env.UNKEY_ROOT_KEY)
      throw new ApplicationError(
        "Missing root key secret.",
        {},
        "client/unkey"
      );

    this._baseHeaders = {
      Authorization: `Bearer ${this._unkeyRootToken}`,
    };

    switch (action) {
      case "CREATE_KEY":
        this._unkeyUrlParams = "/keys.createKey";
        break;

      default:
        break;
    }
  }

  public get create() {
    return async (opts: TCreateKeyOpts) => {
      const requestInfo = {
        method: "POST",
        headers: this._baseHeaders,
        body: { ...opts },
      };
      try {
        return await this._httpClient<TCreateKeyResult | TErrorResult>(
          this._baseUrl + this._unkeyUrlParams,
          requestInfo
        );
      } catch (error) {
        throw new NetworkError(
          "UNKEY API CLIENT ERROR",
          { error },
          "client/unkey"
        );
      }
    };
  }

  public get update() {
    return {};
  }

  public get delete() {
    return {};
  }
}
