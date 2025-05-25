import type { H3Event } from "h3";

import { Base } from "./_base";

import { UserService, UserServiceError } from "@/services/user";
import { ApplicationError } from "@/errors/application";
import { NetworkError } from "@/errors/network";

export class UserController extends Base {
  public _userService: UserService;

  constructor(event: H3Event, userService: UserService = new UserService()) {
    super(event);

    this._userService = userService;

    if (!event.context.isUserVerified)
      throw this.mapErrorResponse(
        new UserControllerError("Unauthorized", 401, {
          resolution: "Make sure user is verified",
        })
      );
  }

  public async get() {}

  public async create() {
    try {
      const query = getQuery(this.nitroEvent);

      if (!query.user)
        throw new UserControllerError("User not found", 401, {
          resolution: "Make sure user is included in the request query",
        });

      const d = await this._userService.create(query.user);
      return { success: true, error: null, data: d };
    } catch (error) {
      return this.mapErrorResponse(error);
    }
  }

  public async update() {}

  public async delete() {}

  protected mapErrorResponse(error: unknown) {
    switch (true) {
      case error instanceof UserControllerError:
        setResponseStatus(this.nitroEvent, error.statusCode, error.name);
        return { success: false, error: error.message, data: null };

      case error instanceof ApplicationError:
        setResponseStatus(this.nitroEvent, error.statusCode, error.name);
        return { success: false, error: error.message, data: null };

      case error instanceof NetworkError:
        setResponseStatus(this.nitroEvent, error.statusCode, error.name);
        return sendNoContent(this.nitroEvent, 500);

      case error instanceof UserServiceError:
        setResponseStatus(this.nitroEvent, error.statusCode, error.name);
        return sendNoContent(this.nitroEvent, error.statusCode);

      default:
        setResponseStatus(this.nitroEvent, 500, "Internal Server Error");
        return sendNoContent(this.nitroEvent, 500);
    }
  }
}

export class UserControllerError extends ApplicationError {
  constructor(message: string, code: number, data: object = {}) {
    super(message, code, true, data);

    this.name = "USER CONTROLLER ERROR";
  }
}
