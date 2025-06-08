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
    return {
      user: async (data: UserEntity) => this._createUser(data),
    };
  }

  get update() {
    return {};
  }

  get delete() {
    return {};
  }

  private async _createUser(data: Parameters<(typeof this.create)["user"]>[0]) {
    try {
      return await this._httpClient<TBackendCreateUserApiResponse>(
        this._baseUrl + "/api/user",
        ConfigUtils.createUserOpts(data, {
          headers: ConfigUtils.baseHeaders(this.config),
        })
      );
    } catch (error) {
      throw this._formatAndRethrowNetworkError(
        error,
        "client/backend/BackendApiClient/_createUser"
      );
    }
  }

  private _formatAndRethrowNetworkError(
    error: unknown,
    originContext: `client/backend/BackendApiClient/${string}`
  ) {
    throw new NetworkError(
      error instanceof FetchError
        ? error.message
        : NetworkError._unexpectedErrorMessage,
      { error },
      originContext
    );
  }
}
