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
      const res = await UserFactory.exposeBackendApiClient(
        uniqueUserKey
      ).create.user(ClerkWebhookFactory.validateWebhookUserData(webhookEntity));

      return res;
    } catch (error) {
      throw this.mapError(error);
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
    this.name = "USER SERVICE ERROR";
    if (rawError) this.context = this._isDevMode ? rawError : {};
  }
}
