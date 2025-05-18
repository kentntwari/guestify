import type { ClerkWebhookEntity } from "entities/webhook.clerk";
import type { FetchOptions } from "ofetch";

export class WebhookClerkDTO {
  private _webhookEntity: ClerkWebhookEntity;

  constructor(webhookEntity: ClerkWebhookEntity) {
    this._webhookEntity = webhookEntity;
  }

  get newUserRequestOptions() {
    if (!this._webhookEntity.data.user) return {};

    return {
      method: "POST",
      query: {
        user: {
          id: this._webhookEntity.data.user.id,
          firstName: this._webhookEntity.data.user.first_name,
          lastName: this._webhookEntity.data.user.last_name,
          email: this._webhookEntity.data.user.email_addresses[0].email_address,
          imageUrl:
            this._webhookEntity.data.user.has_image === false
              ? null
              : this._webhookEntity.data.user.image_url,
        },
      },
    } satisfies FetchOptions;
  }
}
