import { Base as BaseService } from "services/_base";

import { ClerkWebhookEntity } from "entities/webhook.clerk";

import { UserFactory, UserFactoryError } from "factory/user";
import {
  ClerkWebhookFactory,
  ClerkWebhookFactoryError,
} from "factory/webhook.clerk";

import { ApplicationError } from "errors/application";
import { NetworkError } from "errors/network";

export class UserService extends BaseService {
  constructor() {
    super();
  }

  async requestUserCreationFromWebhook(
    webhookEntity: ClerkWebhookEntity,
    uniqueUserKey: string
  ) {
    try {
      return await UserFactory.prepareClient(uniqueUserKey).create.user(
        ClerkWebhookFactory.validateWebhookUserData(webhookEntity)
      );
    } catch (error) {
      this.mapError(error);
    }
  }

  protected mapError(error: unknown) {
    switch (true) {
      case error instanceof NetworkError:
        throw error;

      case error instanceof ApplicationError:
        throw error;

      case error instanceof UserFactoryError ||
        error instanceof ClerkWebhookFactoryError:
        throw new UserServiceError(error.message, error);

      default:
        throw new UserServiceError(
          "Unexpected error occurred in UserService class",
          error
        );
    }
  }
}

export class UserServiceError extends ApplicationError {
  constructor(message: string, rawError: unknown = null) {
    super(message);
    this.name = "CLERK SERVICE ERROR";
    if (rawError) this.context = this._isDevMode ? rawError : {};
    console.log(this);
  }
}
