import type { TBackendCreateUserApiResponse } from "utils/schemas.zod";

import { ofetch as $fetch, type $Fetch, FetchError } from "ofetch";

import { Base as BaseClient } from "client/_base";
import { NetworkError } from "errors/network";

import { ConfigUtils } from "utils/config";
import type { UserEntity } from "entities/user";

export class BackendApiClient extends BaseClient {
  protected _httpClient: $Fetch = $fetch;
  protected _baseUrl: string =
    process.env.APP_BACKEND_ENPOINT || "http://localhost:3000";

  constructor(protected config: ConfigUtils) {
    super();
  }

  get create() {
    try {
      return {
        user: async (data: UserEntity) => {
          return await this._httpClient<TBackendCreateUserApiResponse>(
            this._baseUrl + "/api/user",
            ConfigUtils.createUserOpts(data, {
              headers: ConfigUtils.baseHeaders(this.config),
            })
          );
        },
      };
    } catch (error) {
      throw new NetworkError(
        error instanceof FetchError
          ? error.message
          : "Unexpected network error occurred",
        { error },
        origin
      );
    }
  }

  get update() {
    return {};
  }

  get delete() {
    return {};
  }
}
