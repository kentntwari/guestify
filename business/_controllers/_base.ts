import { H3Error, H3Event, send } from "h3";
import { ZodError } from "zod";

const ERROR_CODES = [
  "OPERATION_FAILED",
  "BAD_REQUEST",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "INVALID_DATA",
  "METHOD_NOT_ALLOWED",
  "FORBIDDEN",
  "INTERNAL_SERVER_ERROR",
] as const;

interface IApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  error?: {
    code: string | undefined;
    message: string;
  };
}

interface IJsonResponse extends Object {}

export class ApiResponse {
  static success<T>(data: T): IApiResponse<T> {
    return {
      status: "success",
      data,
    };
  }

  static error(
    code: (typeof ERROR_CODES)[number] | undefined,
    message: string
  ): IApiResponse<null> {
    return {
      status: "error",
      error: { code, message },
    };
  }

  static withJson(data: {}): IJsonResponse {
    return { ...data };
  }
}

export class BadRequestResponse extends H3Error {
  constructor(message: string, data: {} = {}) {
    super(message);
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message,
      data,
    });
  }
}

export class UnauthorizedResponse extends H3Error {
  constructor(message: string = "Make sure user is verified") {
    super(message);
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message,
    });
  }
}

export class ForbiddenResponse extends H3Error {
  constructor(
    message: string = "You don't have permission to access this resource"
  ) {
    super(message);
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message,
    });
  }
}

export class ValidationErrorResponse extends H3Error {
  constructor(error: ZodError) {
    super("Validation Error");
    throw createError({
      statusCode: 422,
      statusMessage: "Unprocessable Entity",
      message: "Validation Error",
      data: {
        issues: error.issues,
      },
    });
  }
}

export class MethodNotAllowedResponse extends H3Error {
  constructor(message: string = "Method Not Allowed") {
    super(message);
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
      message,
    });
  }
}

export class NotFoundResponse extends H3Error {
  constructor(message: string, data: {} = {}) {
    super(message);
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message,
      data,
    });
  }
}

export class NotImplementedResponse extends H3Error {
  constructor(message: string = "This endpoint is not available") {
    super(message);
    throw createError({
      statusCode: 501,
      statusMessage: "Not Implemented",
      message,
    });
  }
}

export class InternalServerErrorResponse extends H3Error {
  constructor(message: string, data: {} = {}) {
    super(message);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message,
      data,
    });
  }
}

export abstract class Base {
  private _httpRequest: H3Event["node"]["req"];

  constructor(private _nitroEvent: H3Event) {
    this._httpRequest = _nitroEvent.node.req;
  }

  public get nitroEvent() {
    return this._nitroEvent;
  }

  public get httpRequest() {
    return this._httpRequest;
  }

  public abstract get(...params: any): Promise<ApiResponse | void>;
  public abstract create(...params: any): Promise<ApiResponse | void>;
  public abstract update(...params: any): Promise<ApiResponse | void>;
  public abstract delete(...params: any): Promise<ApiResponse | void>;
  protected abstract mapErrorResponse(error: unknown): void | ApiResponse;
}
