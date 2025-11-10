import { redirect } from "react-router";

import {
  BadRequestResponse,
  Base as BaseController,
  RedirectResponse,
  StatusResponse,
} from "./_base";

import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";
import { redis } from "utils/redis";

import { CsrfTokenManager } from "security/csrf";
import { EventFactory } from "_factory/event";
import { EventService, EventServiceError } from "_services/event";
import { EventEntity } from "_entities/event";

export class EventController extends BaseController {
  constructor(
    req: Request,
    private USER_API_KEY: string,
    private eventService: EventService = new EventService()
  ) {
    super(req);
  }

  async create() {
    try {
      await this.sanitizeRequest(
        this.request,
        new CsrfTokenManager(this.USER_API_KEY),
        ["application/json"],
        ["x-csrf-token"]
      );

      const event = await this.eventService.registerEvent(
        EventFactory.toValidateEvent(await this.getBody()),
        this.USER_API_KEY
      );

      if (event.status === "created" && event.data instanceof EventEntity)
        throw new RedirectResponse("/events");

      if (event.status === "error") throw event.error;
      else
        throw new EventsControllerError(
          "Unknown error occurred during event creation",
          event
        );
    } catch (error) {
      if (error instanceof RedirectResponse) return error;
      return this.mapErrorResponse(error);
    }
  }

  async update() {
    return new BadRequestResponse("Bad request: Invalid operation");
  }
  async delete() {
    return new BadRequestResponse("Bad request: Invalid operation");
  }

  protected async sanitizeRequest(
    req: Request,
    csrfTokenManager: CsrfTokenManager,
    contentTypes: string[],
    headers: string[]
  ) {
    this.validateContentType(
      contentTypes,
      `Unsupported Content-Type. Supported types: ${contentTypes.join(", ")}`
    );
    this.validateHeaders(headers, "Missing CSRF token");

    const { error } = await csrfTokenManager.verifyToken(
      this.headers.get("x-csrf-token")!
    );

    if (error) throw new EventsControllerError(error.message);
  }

  protected mapErrorResponse(error: unknown) {
    console.log(error);
    switch (true) {
      case error instanceof EventsControllerError:
        return new BadRequestResponse(error.message);

      case error instanceof EventServiceError:
        return new StatusResponse(error.message, 422);

      case error instanceof ApplicationError:
        return new StatusResponse(error.message, 500);

      case error instanceof NetworkError:
        return new StatusResponse(error.message, 503);
      default:
        return new StatusResponse("Internal Server Error", 500);
    }
  }
}

export class EventsControllerError extends ApplicationError {
  constructor(message: string, error: unknown = null) {
    super(message);

    this.name = "EVENTS CONTROLLER ERROR";
    this.context = this._isDevMode && error ? error : { message: this.message };
  }
}
