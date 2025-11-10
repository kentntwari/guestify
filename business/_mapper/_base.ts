import type { ZodError } from "zod";

interface IResult<T> {
  success: boolean;
  error: ZodError | string | null;
  data: T | null;
}

export abstract class Base {
  static toResultSuccess<T>(data: T): IResult<T> {
    return {
      success: true,
      error: null,
      data,
    };
  }

  static toResultError(error: unknown): IResult<null> {
    return {
      success: false,
      error: JSON.stringify(error),
      data: null,
    };
  }
}
