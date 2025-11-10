import { destr } from "destr";

import { UserEntity } from "@/_entities/user";
import { ApplicationError } from "@/errors/application";
import { userSchema } from "@/utils/schemas.zod";

export class UserFactory {
  static validate(user: unknown) {
    const { error, data } = userSchema.safeParse(destr(user));

    if (error)
      throw new UserFactoryError(`Invalid user data: ${error.message}`);
    
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
  constructor(message: string, code?: number, data: object = {}) {
    super(message, code, true, data);

    this.name = "USER FACTORY ERROR";
    console.log(this);
  }
}
