import type { FetchOptions } from "ofetch";
import type { BackendApiClient } from "client/backend";
import { WebhookClerkDTO } from "dto/webhook.clerk";
import { ClerkWebhookEntity } from "entities/webhook.clerk";
import { ApplicationError } from "errors/application";
import { ClerkWebhookFactory } from "./webhook.clerk";

export class UserFactory {
  static userRequestOpts(
    webhookEntity: ClerkWebhookEntity,
    opts: FetchOptions
  ) {
    return {
      ...opts,
      method: "POST",
      query: WebhookClerkDTO.createNewUserQuery(
        ClerkWebhookFactory.validateWebhookUserData(webhookEntity)
      ),
    } satisfies FetchOptions;
  }

  static async createUser(
    webhookEntity: ClerkWebhookEntity,
    backendApiClient: BackendApiClient
  ) {
    return await backendApiClient.create.user(webhookEntity);
  }
}

export class UserFactoryError extends ApplicationError {
  constructor(message: string, error: unknown) {
    super(message, { error }, "factory/user");

    this.name = "USER FACTORY ERROR";
    console.log(this);
  }
}
