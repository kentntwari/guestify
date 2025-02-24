import { Prisma } from "@prisma/client";
import { H3Error } from "h3";

interface IUserActions {
  action: "CREATE" | "UPDATE" | "DELETE";
}

export class UserServiceError extends H3Error {
  public action: IUserActions["action"];
  public misc: {};

  constructor(
    serviceAction: IUserActions["action"],
    rawError:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientRustPanicError
      | any,
    misc?: {}
  ) {
    super("USER SERVICE ERROR");

    this.action = serviceAction;
    this.misc = misc ?? {};

    switch (true) {
      case rawError instanceof Prisma.PrismaClientKnownRequestError:
        this.statusCode = 400;
        this.statusMessage = "Prisma Error";
        this.cause = {
          code: rawError.code,
          message: rawError.message,
          meta: rawError.meta,
        };
        break;

      case rawError instanceof Prisma.PrismaClientUnknownRequestError:
        this.statusCode = 400;
        this.statusMessage = "Prisma Error";
        this.cause = {
          message: rawError.message,
        };
        break;

      case rawError instanceof Prisma.PrismaClientRustPanicError:
        this.statusCode = 500;
        this.statusMessage = "Prisma Error";
        this.cause = {
          message: rawError.message,
        };
        break;

      case rawError instanceof Prisma.PrismaClientInitializationError:
        this.statusCode = 500;
        this.statusMessage = "Prisma Error";
        this.cause = {
          code: rawError.errorCode,
          message: rawError.message,
        };
        break;

      default:
        this.statusMessage = "Something went wrong";
        if ("message" in rawError)
          this.cause = {
            message: rawError.message,
          };
        break;
    }
  }

  set statusCode(status: number) {
    this.statusCode = status;
  }
}
