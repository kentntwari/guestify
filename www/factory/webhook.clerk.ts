import type { WebhookEvent } from "@clerk/react-router/ssr.server";

import { ClerkWebhookEntity } from "entities/webhook.clerk";

import { ApplicationError } from "errors/application";

export class ClerkWebhookFactory {
  static getWebhookEvent(event: WebhookEvent) {
    return new ClerkWebhookEntity(event);
  }

  static validateWebhookUserData(webhookEntity: ClerkWebhookEntity) {
    if (!webhookEntity.data.user)
      throw new ClerkWebhookFactoryError(
        ClerkWebhookFactoryError._missingWebhookUserDataMsg,
        {
          user: JSON.stringify(webhookEntity.data.user),
        }
      );
    return webhookEntity.data.user;
  }
}

export class ClerkWebhookFactoryError extends ApplicationError {
  public static _missingWebhookUserDataMsg: string =
    "User data missing. Ensure user data is sent within the webhook";

  constructor(message: string, error: unknown) {
    super(message, { error }, "factory/user");

    this.name = "CLERK WEBHOOK FACTORY ERROR";
    console.log(this);
  }
}
