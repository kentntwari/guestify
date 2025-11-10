import { ClerkWebhookEntity } from "_entities/webhook.clerk";
import { UserEntity } from "_entities/user";

import { ApplicationError } from "errors/application";
import { ClerkApiClient } from "_client/clerk";
import { ConfigUtils } from "utils/config";

export class WebhookClerkFactory {
  static exposeClerkApiClient() {
    if (!process.env.CLERK_SECRET_KEY) {
      throw new WebhookClerkFactoryError("Missing clerk secret key.", {});
    }
    return new ClerkApiClient(new ConfigUtils(process.env.CLERK_SECRET_KEY));
  }

  static validateWebhookUserData(webhookEntity: ClerkWebhookEntity) {
    let w: ClerkWebhookEntity = webhookEntity;

    if (!w.data.user)
      throw new WebhookClerkFactoryError(
        "User data missing. Ensure user data is sent within the webhook",
        {
          user: JSON.stringify(webhookEntity.data.user),
        }
      );

    return new UserEntity(
      w.data.user.id,
      w.data.user.first_name ?? "UNSPECIFIED_FIRST_NAME",
      w.data.user.last_name ?? "UNSPECIFIED_LAST_NAME",
      w.data.user.email_addresses[0]?.email_address ||
        "UNSPECIFIED_EMAIL@DOMAIN.COM",
      w.data.user.image_url ?? "UNSPECIFIED_IMAGE_URL"
    );
  }
}

export class WebhookClerkFactoryError extends ApplicationError {
  constructor(message: string, error: unknown) {
    super(message, { error }, "factory/user");

    this.name = "CLERK WEBHOOK FACTORY ERROR";
    console.log(this);
  }
}
