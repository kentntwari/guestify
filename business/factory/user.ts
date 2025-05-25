import { UserEntity } from "@/entities/user";
import { ApplicationError } from "@/errors/application";
import { userSchema } from "@/utils/schemas.zod";

export class UserFactory {
  static create(user: unknown) {
    const { error, data } = userSchema.safeParse(user);
    if (error) throw new UserFactoryError("Invalid user data", 422, error);
    return new UserEntity(data);
  }
}

export class UserFactoryError extends ApplicationError {
  constructor(message: string, code: number, data: object = {}) {
    super(message, code, true, data);

    this.name = "USER FACTORY ERROR";
    console.log(this);
  }
}
