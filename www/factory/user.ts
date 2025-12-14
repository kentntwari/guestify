import { BackendApiClientProvider } from "client/backend-provider";

import { ApplicationError } from "errors/application";

/**
 * Factory for user-related operations.
 * Delegates to appropriate providers.
 */
export class UserFactory {
  /**
   * Creates a BackendApiClient instance.
   * @param userKey - The authentication key for the backend API
   * @returns A configured BackendApiClient instance
   */
  static exposeBackendApiClient(userKey: string) {
    try {
      return BackendApiClientProvider.create(userKey);
    } catch (error) {
      throw new UserFactoryError(
        "Failed to prepare user factory client",
        error
      );
    }
  }
}

export class UserFactoryError extends ApplicationError {
  constructor(message: string, error: unknown) {
    super(message, { error }, "factory/user");

    this.name = "USER FACTORY ERROR";
  }
}
