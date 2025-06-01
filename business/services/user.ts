import { destr } from "destr";

import { Base as BaseService } from "./_base";
import { UserRepository } from "@/repositories/user";
import { ApplicationError } from "@/errors/application";
import { DatabaseError } from "@/errors/database";
import { UserFactory, UserFactoryError } from "@/factory/user";

export class UserService extends BaseService<UserServiceError> {
  private _userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    super();
    this._userRepository = repository;
  }

  async create(unknownUser: unknown) {
    try {
      return await this._userRepository.create(
        UserFactory.create(destr(unknownUser))
      );
    } catch (error) {
      throw this.mapError(error, "unknow error occured during user creation");
    }
  }

  public mapError(
    error: unknown,
    errorMessage: string | undefined = undefined
  ) {
    switch (true) {
      case error instanceof DatabaseError:
        throw new UserServiceError("User creation failed", 500, {
          rawError: error,
          resolution:
            "Please check the database actions and make sure the user is valid",
        });

      case error instanceof UserFactoryError:
        throw new UserServiceError("User creation failed", 422, {
          rawError: error,
          user: error.data,
          resolution:
            "Please check user data and make sure it is valid according to requirements",
        });

      default:
        throw new UserServiceError(
          !errorMessage ? "Unknown error occured" : errorMessage,
          500,
          {
            rawError: error,
            resolution: "Please check the error and try again",
          }
        );
    }
  }
}

export class UserServiceError extends ApplicationError {
  constructor(message: string, code: number, data: object = {}) {
    super(message, code, true, data);

    this.name = "USER SERVICE ERROR";
  }
}
