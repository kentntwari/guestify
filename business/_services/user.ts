import { Base as BaseService } from "./_base";
import { UserRepository } from "@/_repositories/user";
import { ApplicationError } from "@/errors/application";
import { DatabaseError } from "@/errors/database";
import { UserFactory, UserFactoryError } from "@/_factories/user";
import { UserMapper } from "@/_mapper/user";
import { NetworkError } from "@/errors/network";
import { UserEntity } from "@/_entities/user";

export class UserService extends BaseService<UserServiceError> {
  private _userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    super();
    this._userRepository = repository;
  }

  async registerUser(incomingUser: UserEntity) {
    try {
      const registered = await this._userRepository.create(incomingUser);
      const entity = new UserEntity(
        incomingUser.id,
        registered.email,
        registered.firstName,
        registered.lastName,
        registered.imageUrl ?? ""
      );
      return UserMapper.toResultSuccess(UserMapper.toDTO(entity));
    } catch (error) {
      console.log("Error occurred during user registration:", error);
      return this.mapError(
        error,
        "unknown error occurred during user registration"
      );
    }
  }

  public mapError(
    error: unknown,
    errorMessage: string | undefined = undefined
  ) {
    switch (true) {
      case error instanceof DatabaseError:
        throw new ApplicationError(
          "A database error occurred in UserService",
          500,
          true,
          { ...error }
        );

      case error instanceof UserFactoryError:
        return UserMapper.toResultError("User factory error: " + error.message);

      case error instanceof ApplicationError || error instanceof NetworkError:
        throw error;

      default:
        return UserMapper.toResultError(
          "Service error: " + (errorMessage ?? "An unexpected error occurred")
        );
    }
  }
}

export class UserServiceError extends ApplicationError {
  constructor(message: string, data: object = {}) {
    super(message);

    this.name = "USER SERVICE ERROR";
    this.data = data;
  }
}
