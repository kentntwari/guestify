import { BackendApiClient } from "_client/backend";
import { UserEntity } from "_entities/user";

import { ApplicationError } from "errors/application";
import { ConfigUtils } from "utils/config";

import { BackendCreateUserApiResponseSchema } from "utils/schemas.zod";

export class UserFactory {
  static toBackendApiClient(userKey: string) {
    return new BackendApiClient(new ConfigUtils(userKey));
  }

  static toEntity(rawUser: unknown) {
    console.log("returned rawUser:", rawUser);
    const { success, error, data } = BackendCreateUserApiResponseSchema.pick({
      data: true,
    }).shape.data.safeParse(rawUser);
    if (!success) throw new UserFactoryError(error.message, error);
    return new UserEntity(
      data.id,
      data.email,
      data.firstName,
      data.lastName,
      data.imageUrl ?? ""
    );
  }
}

export class UserFactoryError extends ApplicationError {
  constructor(message: string, error: unknown) {
    super(message, { error }, "factory/user");

    this.name = "USER FACTORY ERROR";
    console.log(this);
  }
}
