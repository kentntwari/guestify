import type { H3Event } from "h3";

import { Base } from "./_base";

import { UserService, UserServiceError } from "@/services/user";
import { ApplicationError } from "@/errors/application";
import { userCreateSchema } from "@/utils/schemas.zod";

type TValidateAction =
  | "CREATE_USER"
  | "UPDATE_USER"
  | "DELETE_USER"
  | "GET_USER";

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

  public async create() {
    try {
      const data = this.validate("CREATE_USER");
      const d = await this._userService.create(data);
      return { success: true, error: null, data: d };
    } catch (error) {
      return this.mapErrorResponse(error);
    }
  }

  private validate(action: TValidateAction) {
    const query = getQuery(this.nitroEvent);

    if (!query.user)
      throw new UserControllerError("User not found", 401, {
        resolution: "Make sure user is included in the request query",
      });

    if (typeof query.user !== "string")
      throw new UserControllerError("Wrong type", 401, {
        resolution: "Make sure user is a string",
      });

    switch (action) {
      case "CREATE_USER": {
        const { error, data } = userCreateSchema.safeParse(
          JSON.parse(query.user)
        );

        if (error)
          throw new UserControllerError("Invalid user data", 422, error);

        return data;
      }

      default: {
        throw new UserControllerError("Invalid action", 422, {
          resolution: "Make sure the action is valid",
        });
      }
    }
  }

  protected mapErrorResponse(error: unknown) {
    switch (true) {
      case error instanceof UserControllerError:
        setResponseStatus(this.nitroEvent, error.statusCode, error.name);
        return { success: false, error: error.message, data: null };

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
