import type { WebhookEvent, User } from "@clerk/react-router/ssr.server";

import { ApplicationError } from "errors/application";

export class ClerkWebhookEntity {
  protected _webhookEvent: WebhookEvent;

  constructor(event: WebhookEvent) {
    this._webhookEvent = event;
  }

  public get type() {
    return this._webhookEvent.type;
  }

  public get data() {
    return {
      user: this.userData,
    };
  }

  private get userData() {
    if (this.type === "user.created")
      return this._webhookEvent.data as User["raw"];
    else
      throw new ApplicationError(
        "Invalid event type. Expected user.created event type but received " +
          this.type
      );
  }
}
