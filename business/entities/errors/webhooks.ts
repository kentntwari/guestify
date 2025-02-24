import { H3Error } from "h3";

import { WebhookEventType } from "@/types/kinde/webhooks";

interface IncomingWebhookParams {
  token?: string;
  webhooktype: WebhookEventType | string | undefined;
}

export class KindeWebhookError
  extends H3Error
  implements IncomingWebhookParams
{
  private readonly webhooktoken: IncomingWebhookParams["token"];
  public readonly webhooktype: IncomingWebhookParams["webhooktype"];
  public potentialResolution: string = "";

  constructor(
    { webhooktype, token }: IncomingWebhookParams,
    contentType: string | undefined | null
  ) {
    super("KINDE WEBHOOK ERROR");
    this.webhooktype = webhooktype;
    this.webhooktoken = token;

    if (contentType !== "application/jwt") {
      this.statusCode = 400;
      this.statusMessage = "Not acceptable";
      this.cause = `The content type came as ${contentType} instead of application/jwt. This may not be an error since kinde calls the webhook multiple times.`;
      this.potentialResolution =
        "Kinde recently changed the contentType from application/json to application/jwt. Please consult the docs";
    }

    if (
      typeof this.webhooktype === "undefined" ||
      typeof this.webhooktype === "string"
    ) {
      this.statusCode = 403;
      this.statusMessage = "Invalid webhook type";
      this.cause =
        "Expected webhook type but instead received " + this.webhooktype;
      this.potentialResolution =
        "Consult the Kinde docs for the available webhook types";
    }

    if (
      typeof this.webhooktoken === "undefined" ||
      typeof this.webhooktoken === "string"
    ) {
      this.statusCode = 400;
      this.statusMessage = "Invalid token";
      this.cause =
        "Expected jwt token but instead received " + this.webhooktoken;
      this.potentialResolution =
        "Use the webhook.site to test POST requests made by the webhook";
    }
  }
}
