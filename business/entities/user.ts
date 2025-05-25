import { ApplicationError } from "@/errors/application";

import { userSchema, type TUserSchema } from "@/utils/schemas.zod";

export class UserEntity implements TUserSchema {
  constructor(private _user: TUserSchema) {}

  public get id() {
    return this._user.id;
  }

  public get email() {
    return this._user.email;
  }

  public get firstName() {
    return this._user.firstName;
  }

  public get lastName() {
    return this._user.lastName;
  }

  public get imageUrl() {
    return this._user.imageUrl;
  }
}

export class UserEntityError extends ApplicationError {
  constructor(message: string, code: number, data: object = {}) {
    super(message, code, true, data);

    this.name = "USER ENTITY ERROR";
  }
}
