import { Prisma } from "@prisma/client";
import { H3Error } from "h3";

import { NetworkError } from "./network";
import { error } from "console";

type TDatabaseActions = "READ" | "CREATE" | "UPDATE" | "DELETE";
type TDatabaseModels = "USER";

export class DatabaseError extends H3Error {
  public action: TDatabaseActions;
  public model: TDatabaseModels;
  public misc: {};

  constructor(
    databaseAction: TDatabaseActions,
    databaseModel: TDatabaseModels,
    rawError:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientRustPanicError
      | unknown,
    misc?: {}
  ) {
    super("DATABASE ERROR");

    this.action = databaseAction;
    this.model = databaseModel;
    this.misc = misc ?? {};

    this.handlePrismaError(rawError);
  }

  private handlePrismaError(rawError: unknown) {
    switch (true) {
      case rawError instanceof Prisma.PrismaClientInitializationError:
        this.statusCode = 500;
        this.statusMessage = "Prisma Error";
        this.cause = {
          code: rawError.errorCode,
          message: rawError.message,
        };
        break;

      case rawError instanceof Prisma.PrismaClientKnownRequestError:
        this.statusCode = 400;
        this.statusMessage = "Prisma Error";
        this.cause = JSON.stringify({
          code: rawError.code,
          message: rawError.message,
          meta: rawError.meta,
        });
        break;

      case rawError instanceof Prisma.PrismaClientUnknownRequestError:
        this.statusCode = 400;
        this.statusMessage = "Prisma Error";
        this.cause = JSON.stringify({
          message: rawError.message,
        });
        break;

      case rawError instanceof Prisma.PrismaClientRustPanicError:
        this.statusCode = 500;
        this.statusMessage = "Prisma Error";
        this.cause = {
          message: rawError.message,
        };
        break;

      default:
        throw new NetworkError(
          "An unexpected error occurred during a database operation",
          500,
          error
        );
    }
  }
}
