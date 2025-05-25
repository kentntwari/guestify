export abstract class Base<TServiceError> {
  protected abstract mapErrorResponse(error: unknown): void | TServiceError;
}
