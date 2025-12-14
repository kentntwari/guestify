import { BackendApiClientProvider } from "_client/backend-provider";
import { UserMapper, UserMapperError } from "_mapper/user";

/**
 * Factory for user-related operations.
 * Delegates to appropriate providers and mappers.
 */
export class UserFactory {
  /**
   * Creates a BackendApiClient instance.
   * @param userKey - The authentication key for the backend API
   * @returns A configured BackendApiClient instance
   */
  static toBackendApiClient(userKey: string) {
    return BackendApiClientProvider.create(userKey);
  }

  /**
   * Converts backend API response data to a UserEntity.
   * @param rawUser - The backend API response (full response or data object)
   * @returns A UserEntity instance
   * @throws {UserMapperError} If validation fails
   */
  static toEntity(rawUser: unknown) {
    return UserMapper.fromBackendResponse(rawUser);
  }
}

// Re-export UserMapperError as UserFactoryError for backward compatibility
export { UserMapperError as UserFactoryError };
