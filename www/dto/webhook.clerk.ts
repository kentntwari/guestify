import type { ClerkWebhookEntity } from "entities/webhook.clerk";
import type { FetchOptions } from "ofetch";

export class WebhookClerkDTO {
  static createNewUserQuery(
    userData: NonNullable<ClerkWebhookEntity["data"]["user"]>
  ) {
    return {
      user: {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email_addresses[0].email_address,
        imageUrl: userData.has_image === false ? null : userData.image_url,
      },
    } satisfies FetchOptions["query"];
  }
}
