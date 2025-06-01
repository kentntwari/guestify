import type { WebhookEvent } from "@clerk/react-router/ssr.server";

import { Webhook } from "svix";

import { Base as BaseController } from "controllers/_base";

import {
  ClerkWebhookService,
  ClerkWebhookServiceError,
} from "services/webhook.clerk";

import { ClerkWebhookEntity } from "entities/webhook.clerk";

import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";

type SvixHeaders = {
  id: string;
  timestamp: string;
  signature: string;
};

export class ClerkWebhookController extends BaseController {
  private _webhookInstance: Webhook;
  protected _webhookEvent: unknown;

  constructor(req: Request) {
    super(req);
    this._webhookInstance = new Webhook(
      process.env.WEBHOOK_SIGNING_SECRET || ""
    );
  }

  public async handleWebhookEvent() {
    try {
      const event = await this.verifyWebhookEvent();
      await new ClerkWebhookService().processWebhook(
        new ClerkWebhookEntity(event)
      );
      return new Response("success", { status: 200 });
    } catch (error) {
      return this.mapErrorResponse(error);
    }
  }

  private validateMethod() {
    if (this.request.method.toUpperCase() !== "POST")
      throw new ClerkWebhookControllerError(
        "Invalid HTTP request method",
        this.request
      );
  }

  protected get svixHeaders(): SvixHeaders {
    const id = this.request.headers.get("svix-id");
    const timestamp = this.request.headers.get("svix-timestamp");
    const signature = this.request.headers.get("svix-signature");

    if (!!id && !!timestamp && !!signature) return { id, timestamp, signature };
    throw new ClerkWebhookControllerError(
      "Invalid headers. Cannot verify webhook event",
      this.request
    ).resolveHeadersError();
  }

  private async verifyWebhookEvent() {
    this.validateMethod();
    const payload = await this.getBody();

    this._webhookEvent = this._webhookInstance.verify(JSON.stringify(payload), {
      "svix-id": this.svixHeaders.id,
      "svix-timestamp": this.svixHeaders.timestamp,
      "svix-signature": this.svixHeaders.signature,
    });

    if (
      !!this._webhookEvent &&
      typeof this._webhookEvent === "object" &&
      "type" in this._webhookEvent &&
      "data" in this._webhookEvent
    )
      return this._webhookEvent as WebhookEvent;
    else throw new ApplicationError("Unable to retrieve webhook event");
  }

  protected mapErrorResponse(error: unknown): Response {
    switch (true) {
      case error instanceof ClerkWebhookControllerError:
        return new Response(error.message, {
          status: 400,
          statusText: "Controller Error",
        });

      case error instanceof ClerkWebhookServiceError:
        return new Response(error.message, {
          status: 422,
          statusText: "Service Error",
        });

      case error instanceof ApplicationError:
        return new Response(error.message, {
          status: 500,
          statusText: "Application Error",
        });

      case error instanceof NetworkError:
        return new Response(error.message, {
          status: 502,
          statusText: "Network Error",
        });

      default:
        return new Response("Internal Server Error", {
          status: 500,
          statusText: "Unknown Error",
        });
    }
  }
}

export class ClerkWebhookControllerError extends ApplicationError {
  private request: Request;

  constructor(message: string, req: Request) {
    super(message);
    this.request = req;
    this.resolveMethodError();
  }

  private resolveMethodError() {
    if (this.request.method !== "POST") {
      this.cause = `${this.request.method} is not allowed`;
      this.resolution = this._isDevMode
        ? "Only POST requests allowed. Please modify your request method"
        : "";
    }
  }

  public resolveHeadersError() {
    this.cause = this._isDevMode
      ? "Missing svix headers needed to validate the webhook"
      : "";
    this.resolution = this._isDevMode
      ? "Please check webhook in isolation"
      : "Contact the development team for support";
    this.context = this._isDevMode
      ? { headers: JSON.stringify(this.request.headers) }
      : "";
  }
}
