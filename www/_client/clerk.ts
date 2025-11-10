import { type User, getAuth } from "@clerk/react-router/ssr.server";

import { ofetch as $fetch, FetchError, type $Fetch } from "ofetch";

import { ConfigUtils } from "utils/config";

import { Base as BaseClient } from "./_base";
import { NetworkError } from "errors/network";
import type { WebhookClerkMapper } from "_mapper/webhook.clerk";
import type { UserEntity } from "_entities/user";

export class ClerkApiClient extends BaseClient {
  protected _httpClient: $Fetch = $fetch;
  protected _baseUrl: string = "https://api.clerk.com/v1";

  constructor(protected config: ConfigUtils) {
    super();
  }

  get read() {
    return {};
  }

  get create() {
    return {};
  }

  get update() {
    return {
      user: () => {},
      metadata: (
        user: Parameters<
          (typeof WebhookClerkMapper)["toUpdateUserMetadata"]
        >[0] & {
          id: UserEntity["id"];
        }
      ) => this.updateUserMetadata(user),
    };
  }

  get delete() {
    return {};
  }

  private async updateUserMetadata(
    user: Parameters<(typeof this.update)["metadata"]>[0]
  ) {
    try {
      return await this._httpClient<NonNullable<User["raw"]>>(
        this._baseUrl + "/users/" + user.id,
        ConfigUtils.updateClerkUserMetadataOpts(
          { ...user },
          { headers: ConfigUtils.baseHeaders(this.config) }
        )
      );
    } catch (error) {
      throw this.formatAndRethrowNetworkError(
        error,
        "client/backend/ClerkApiClient/updateUserMetadata"
      );
    }
  }

  private formatAndRethrowNetworkError(
    error: unknown,
    originContext: `client/backend/ClerkApiClient/${string}`
  ) {
    console.log(error);
    throw new NetworkError(
      error instanceof FetchError
        ? error.message
        : NetworkError._unexpectedErrorMessage,
      { error },
      originContext
    );
  }
}
