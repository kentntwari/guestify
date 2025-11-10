import { ZodError } from "zod";

export const TResultStatusArr = [
  "validated",
  "created",
  "updated",
  "deleted",
  "error",
] as const;

export type TResultStatus = (typeof TResultStatusArr)[number];

export type TResultWrapper<T, K = TResultStatus> = Promise<{
  status: K;
  data: T | undefined;
  error: ZodError | unknown | undefined;
}>;

export class BaseMapper {
  static toResultSuccess<T>(
    status: Exclude<TResultStatus, "error">,
    data: T
  ): TResultWrapper<T, Exclude<TResultStatus, "error">> {
    return Promise.resolve({
      status,
      data,
      error: undefined,
    });
  }

  static toResultError(
    error: ZodError | unknown
  ): TResultWrapper<undefined, Extract<TResultStatus, "error">> {
    return Promise.resolve({
      status: "error",
      data: undefined,
      error,
    });
  }
}
