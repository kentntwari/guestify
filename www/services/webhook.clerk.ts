import type { WebhookEvent } from "@clerk/react-router/ssr.server";

import { ClerkWebhookEntity } from "entities/webhook.clerk";
import { BackendApiClient } from "client/backend";

import {
  UnkeySecretService,
  UnkeySecretServiceError,
} from "services/secrets.unkey";

import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";

export class ClerkWebhookService {
  protected _webhookEntity: ClerkWebhookEntity;
  private _backendApiClient: BackendApiClient | undefined;

  constructor(webhookEvent: WebhookEvent) {
    this._webhookEntity = new ClerkWebhookEntity(webhookEvent);
  }

  private mapErrors(error: unknown) {
    switch (true) {
      case error instanceof ClerkWebhookServiceError:
        throw error;

      case error instanceof ApplicationError:
        throw error;

      case error instanceof NetworkError:
        throw error;

      case error instanceof UnkeySecretServiceError:
        throw new ApplicationError(
          error.message,
          { error },
          "services/secrets.unkey"
        );

      default:
        throw new ApplicationError(
          "Unexpected error occured",
          { error },
          "services/webhook.clerk"
        );
    }
  }

  public processEvent() {
    switch (this._webhookEntity.type) {
      case "user.created":
        return this.createNewUser();

      default:
        throw new ClerkWebhookServiceError(
          "Expected valid user webhook event type but received" +
            this._webhookEntity.type
        );
    }
  }

  private async createNewUser(
    uniqueUserKey: UnkeySecretService = new UnkeySecretService()
  ) {
    try {
      const userData = this._webhookEntity.data.user;

      if (!userData)
        throw new ClerkWebhookServiceError(
          "Expected valid user data but received" + typeof userData
        );

      const unkey = await uniqueUserKey.generate(userData.id, {
        fullName: `${userData.first_name} ${userData.last_name}`,
        email: userData.email_addresses[0].email_address,
      });

      this._backendApiClient = new BackendApiClient(unkey.key);
      return await this._backendApiClient.create.user(this._webhookEntity);
    } catch (error) {
      return this.mapErrors(error);
    }
  }
}

export class ClerkWebhookServiceError extends ApplicationError {
  protected _isDevMode: boolean;

  constructor(message: string, rawError: unknown = null) {
    super(message);

    this._isDevMode = process.env.NODE_ENV !== "production";
    this.name = "CLERK SERVICE ERROR";

    if (rawError) this.context = this._isDevMode ? rawError : {};
  }
}
