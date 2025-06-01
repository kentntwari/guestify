import { Base as BaseService } from "services/_base";

import type { ClerkWebhookEntity } from "entities/webhook.clerk";

import {
  UnkeySecretService,
  UnkeySecretServiceError,
} from "services/secrets.unkey";
import { UserService } from "services/user";

import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";

import { ClerkWebhookFactory } from "factory/webhook.clerk";

export class ClerkWebhookService extends BaseService {
  constructor(
    private unkeyService: UnkeySecretService = new UnkeySecretService(),
    private userService: UserService = new UserService()
  ) {
    super();
  }

  public processWebhook(webhook: ClerkWebhookEntity) {
    switch (webhook.type) {
      case "user.created":
        return this.createUserFromWebhook(webhook);

      default:
        throw new ClerkWebhookServiceError(
          "Expected valid user webhook event type but received" + webhook.type
        );
    }
  }

  private async createUserFromWebhook(webhook: ClerkWebhookEntity) {
    try {
      const data = ClerkWebhookFactory.validateWebhookUserData(webhook);

      const unkey = await this.unkeyService.generate(data.id, {
        fullName: data.fullName,
        email: data.emailAddress,
      });

      return await this.userService.requestUserCreationFromWebhook(
        webhook,
        unkey.key
      );
    } catch (error) {
      this.mapError(error);
    }
  }

  protected mapError(error: unknown) {
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
}

export class ClerkWebhookServiceError extends ApplicationError {
  constructor(message: string, rawError: unknown = null) {
    super(message);
    this.name = "CLERK SERVICE ERROR";
    if (rawError) this.context = this._isDevMode ? rawError : {};
  }
}
