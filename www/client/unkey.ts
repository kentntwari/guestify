import type { $Fetch } from "ofetch";
import type {
  TUnkeyCreateKeyResponse,
  TUnkeyErrorResponse,
  TUnkeyCreateKeyRequestOptions,
} from "utils/schemas.zod";

import { ofetch as $fetch } from "ofetch";

import { Base as BaseClient } from "client/_base";
import { NetworkError } from "errors/network";
import { ConfigUtils } from "utils/config";

type TUnkeySecretsControllerAction =
  | "CREATE_KEY"
  | "DELETE_KEY"
  | "UPDATE_KEY"
  | "GET_KEY";

export class UnkeyApiClient extends BaseClient {
  protected _httpClient: $Fetch = $fetch;
  protected _baseUrl: string = "https://api.unkey.dev/v1";

  constructor(
    action: TUnkeySecretsControllerAction,
    protected config: ConfigUtils
  ) {
    super();

    switch (action) {
      case "CREATE_KEY":
        this._baseUrl = this._baseUrl + "/keys.createKey";
        break;

      default:
        this._baseUrl;
        break;
    }
  }

  public get create() {
    return async (data: TUnkeyCreateKeyRequestOptions) => {
      try {
        return await this._httpClient<
          TUnkeyCreateKeyResponse | TUnkeyErrorResponse
        >(
          this._baseUrl,
          ConfigUtils.createUnkeyOpts(data, {
            headers: ConfigUtils.baseHeaders(this.config),
          })
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
