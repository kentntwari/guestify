import { ApplicationError } from "@/errors/application";
import { Plan } from "@prisma/client";

export class UserEntity {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public profilePicture: string,
    protected meta: { plan?: Plan } = { plan: "FREE" }
  ) {}
}

export class UserEntityError extends ApplicationError {
  constructor(message: string, data: object = {}) {
    super(message);

    this.name = "USER ENTITY ERROR";
    this.data = data;
  }
}
