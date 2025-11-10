import { Base as BaseService } from "_services/_base";

import { UserEntity } from "_entities/user";

import { UserFactory, UserFactoryError } from "_factory/user";

import { UserMapper } from "_mapper/user";

import { ApplicationError } from "errors/application";
import { NetworkError } from "errors/network";

export class UserService extends BaseService {
  constructor() {
    super();
  }

  async createUser(user: UserEntity, uniqueUserKey: string) {
    try {
      const res =
        await UserFactory.toBackendApiClient(uniqueUserKey).create.user(user);
      return UserMapper.toResultSuccess(
        "created",
        UserFactory.toEntity(res.data)
      );
    } catch (error) {
      return UserMapper.toResultError(this.mapError(error));
    }
  }

  protected mapError(error: unknown) {
    switch (true) {
      case error instanceof NetworkError:
        return error;

      case error instanceof ApplicationError:
        return error;

      case error instanceof UserFactoryError:
        return new UserServiceError(error.message, error);

      default:
        return new UserServiceError(
          "Unexpected error occurred in UserService class",
          error
        );
    }
  }
}

export class UserServiceError extends ApplicationError {
  constructor(message: string, rawError: unknown = null) {
    super(message);
    this.name = "CLERK SERVICE ERROR";
    if (rawError) this.context = this._isDevMode ? rawError : {};
    console.log(this);
  }
}
