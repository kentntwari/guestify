export abstract class Base<TServiceError> {
  protected abstract mapError(error: unknown): void | TServiceError;
}
