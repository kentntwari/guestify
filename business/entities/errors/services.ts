import { Prisma } from "@prisma/client";
import { H3Error } from "h3";

type TServices = "USER" | "EVENT";
type TServiceActions = "CREATE" | "UPDATE" | "DELETE";

export class ServiceError extends H3Error {
  public service: TServices;
  public action: TServiceActions;
  public misc: {};

  constructor(
    service: TServices,
    serviceAction: TServiceActions,
    rawError:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientRustPanicError
      | unknown,
    misc?: {}
  ) {
    super(service + "SERVICE ERROR");

    this.service = service;
    this.action = serviceAction;
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

      default:
        this.statusCode = 500;
        this.statusMessage = "Unknown Error";
        this.cause = {
          message: "An unexpected error occurred during service operation",
          originalError:
            rawError instanceof Error ? rawError.message : String(rawError),
        };
    }
  }
}
