import { ofetch as $fetch, type $Fetch, FetchError } from "ofetch";
import type { ClerkWebhookEntity } from "entities/webhook.clerk";

import { Base } from "client/_base";
import { UserFactory } from "factory/user";
import { NetworkError } from "errors/network";

export class BackendApiClient extends Base {
  protected _httpClient: $Fetch = $fetch;
  protected _baseHeaders: {
    Authorization: `Bearer ${string}`;
    "X-Unkey-Secret": string;
  };
  protected _baseUrl: string =
    process.env.APP_BACKEND_ENPOINT || "http://localhost:3000";
  private _apiKey: string;

  constructor(unkeySecretApiKey: string) {
    super();

    this._apiKey = unkeySecretApiKey;
    this._baseHeaders = {
      Authorization: `Bearer ${this._apiKey}`,
      "X-Unkey-Secret": this._apiKey,
    };
  }

  get create() {
    try {
      return {
        user: async (webhookEntity: ClerkWebhookEntity) => {
          return await this._httpClient(
            this._baseUrl + "/api/user",
            UserFactory.userRequestOpts(webhookEntity, {
              headers: this._baseHeaders,
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
