import { Base as BaseMapper } from "@/_mapper/_base";

export abstract class Base<TServiceError> {
  protected abstract mapError(
    error: unknown
  ): void | BaseMapper | TServiceError;
}
