import { ClerkWebhookEntity } from "entities/webhook.clerk";
import { UserEntity } from "entities/user";

import { ApplicationError } from "errors/application";
import { ClerkApiClient } from "client/clerk";
import { ConfigUtils } from "utils/config";

export class ClerkWebhookFactory {
  static exposeClerkApiClient() {
    if (!process.env.CLERK_SECRET_KEY) {
      throw new ClerkWebhookFactoryError("Missing clerk secret key.", {});
    }
    return new ClerkApiClient(new ConfigUtils(process.env.CLERK_SECRET_KEY));
  }

  static validateWebhookUserData(webhookEntity: ClerkWebhookEntity) {
    let w: ClerkWebhookEntity = webhookEntity;

    if (!w.data.user)
      throw new ClerkWebhookFactoryError(
        ClerkWebhookFactoryError._missingWebhookUserDataMsg,
        {
          user: JSON.stringify(webhookEntity.data.user),
        }
      );

    return new UserEntity(
      w.data.user.id,
      w.data.user.first_name ?? "UNSPECIFIED_FIRST_NAME",
      w.data.user.last_name ?? "UNSPECIFIED_LAST_NAME",
      w.data.user.email_addresses[0].email_address,
      w.data.user.image_url ?? "UNSPECIFIED_IMAGE_URL"
    );
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
