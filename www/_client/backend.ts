import type {
  TBackendCreateEventApiResponse,
  TBackendCreateUserApiResponse,
} from "utils/schemas.zod";

import { ofetch as $fetch, type $Fetch, FetchError } from "ofetch";

import { Base as BaseClient } from "_client/_base";
import { NetworkError } from "errors/network";

import { ConfigUtils } from "utils/config";
import type { UserEntity } from "_entities/user";
import { EventMapper } from "_mapper/event";
import type { EventEntity } from "_entities/event";
import { WebhookClerkMapper } from "_mapper/webhook.clerk";

export class BackendApiClient extends BaseClient {
  protected _httpClient: $Fetch = $fetch;
  protected _baseUrl: string =
    process.env.APP_BACKEND_ENPOINT || "http://localhost:3000";

  constructor(protected config: ConfigUtils) {
    super();
  }

  get read() {
    return {};
  }

  get create() {
    return {
      user: (data: UserEntity) => this.createUser(data),
      event: (data: EventEntity) => this.createEvent(data),
    };
  }

  get update() {
    return {};
  }

  get delete() {
    return {};
  }

  private async createUser(data: Parameters<(typeof this.create)["user"]>[0]) {
    try {
      return await this._httpClient<TBackendCreateUserApiResponse>(
        this._baseUrl + "/api/user",
        ConfigUtils.createUserOpts(WebhookClerkMapper.toCreateUser(data), {
          headers: ConfigUtils.baseHeaders(this.config),
        })
      );
    } catch (error) {
      throw this.formatAndRethrowNetworkError(
        error,
        "client/backend/BackendApiClient/_createUser"
      );
    }
  }

  private async createEvent(
    data: Parameters<(typeof this.create)["event"]>[0]
  ) {
    try {
      return await this._httpClient<TBackendCreateEventApiResponse>(
        this._baseUrl + "/api/event",
        ConfigUtils.createEventOpts(EventMapper.toCreateDto(data), {
          headers: ConfigUtils.baseHeaders(this.config),
        })
      );
    } catch (error) {
      throw this.formatAndRethrowNetworkError(
        error,
        "client/backend/BackendApiClient/_createEvent"
      );
    }
  }

  private formatAndRethrowNetworkError(
    error: unknown,
    originContext: `client/backend/BackendApiClient/${string}`
  ) {
    throw (
      "BackendApiClient Error: " +
      new NetworkError(
        error instanceof FetchError
          ? error.message
          : NetworkError._unexpectedErrorMessage,
        { error },
        originContext
      )
    );
  }
}
