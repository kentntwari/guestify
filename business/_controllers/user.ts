import type { H3Event } from "h3";

import {
  ApiResponse,
  BadRequestResponse,
  Base,
  InternalServerErrorResponse,
  NotImplementedResponse,
  UnauthorizedResponse,
} from "./_base";

import { UserService } from "@/_services/user";
import { ApplicationError } from "@/errors/application";
import { NetworkError } from "@/errors/network";
import { UserFactory } from "@/_factories/user";

export class UserController extends Base {
  public _userService: UserService;

  constructor(event: H3Event, userService: UserService = new UserService()) {
    super(event);
    this._userService = userService;
    if (!event.context.isUserVerified) throw new UnauthorizedResponse();
  }

  public async get() {
    return new NotImplementedResponse();
  }

  public async create() {
    try {
      const query = getQuery(this.nitroEvent);

      if (!query.user)
        return ApiResponse.error("INVALID_DATA", "User data is required");

      const u = UserFactory.validate(query.user);

      const d = await this._userService.registerUser(u);

      if (d.error)
        return ApiResponse.error(
          "OPERATION_FAILED",
          "User registration failed: " + d.error
        );
      return ApiResponse.success(d.data);
    } catch (error) {
      console.log(error);
      return this.mapErrorResponse(error);
    }
  }

  public async update() {
    return new NotImplementedResponse();
  }

  public async delete() {
    return new NotImplementedResponse();
  }

  protected mapErrorResponse(error: unknown) {
    console.log("Mapping error response:", error);
    switch (true) {
      case error instanceof UserControllerError:
        return new BadRequestResponse(error.message);

      case error instanceof ApplicationError:
        return new InternalServerErrorResponse(error.message);

      case error instanceof NetworkError:
        return new InternalServerErrorResponse(error.message);

      default:
        return new InternalServerErrorResponse("An unexpected error occurred");
    }
  }
}

export class UserControllerError extends ApplicationError {
  constructor(message: string, code?: number, data: object = {}) {
    super(message);

    if (code) this.statusCode = code;
    this.name = "USER CONTROLLER ERROR";
    this.data = data;
  }
}
