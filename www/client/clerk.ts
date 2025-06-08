import type { User } from "@clerk/react-router/ssr.server";
import { ConfigUtils } from "utils/config";
import { ofetch as $fetch, FetchError, type $Fetch } from "ofetch";

import { Base as BaseClient } from "./_base";
import { NetworkError } from "errors/network";
import type { WebhookClerkDTO } from "dto/webhook.clerk";
import type { UserEntity } from "entities/user";

export class ClerkApiClient extends BaseClient {
  protected _httpClient: $Fetch = $fetch;
  protected _baseUrl: string = "https://api.clerk.com/v1";

  constructor(protected config: ConfigUtils) {
    super();
  }

  get create() {
    return {};
  }

  get update() {
    return {
      user: () => {},
      metadata: (
        user: Parameters<(typeof WebhookClerkDTO)["updateUserMetadata"]>[0] & {
          id: UserEntity["id"];
        }
      ) => this._updateUserMetadata(user),
    };
  }

  get delete() {
    return {};
  }

  private async _updateUserMetadata(
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
      throw this._formatAndRethrowNetworkError(
        error,
        "client/backend/ClerkApiClient/_updateUserMetadata"
      );
    }
  }

  private _formatAndRethrowNetworkError(
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
