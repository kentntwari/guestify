import type { TUserCreateSchema } from "@/utils/schemas.zod";
import { UserRepository } from "@/repositories/user";
import { ApplicationError } from "@/errors/application";
import { DatabaseError } from "@/errors/database";

export class UserService {
  private _userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this._userRepository = repository;
  }

  async create(user: TUserCreateSchema) {
    try {
      return await this._userRepository.create({
        ...user,
      });
    } catch (error) {
      if (error instanceof DatabaseError)
        throw new UserServiceError("User creation failed", 500, {
          rawError: error,
          resolution:
            "Please check the database actions and make sure the user is valid",
        });

      throw new UserServiceError(
        "unknow error occured during user creation",
        500,
        { rawError: error }
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
