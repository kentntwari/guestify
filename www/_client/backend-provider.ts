import { BackendApiClient } from "_client/backend";
import { ConfigUtils } from "utils/config";

/**
 * Provider for creating BackendApiClient instances.
 * Separates infrastructure concerns from business logic.
 */
export class BackendApiClientProvider {
  /**
   * Creates a BackendApiClient instance with the provided user key.
   * @param userKey - The authentication key for the backend API
   * @returns A configured BackendApiClient instance
   */
  static create(userKey: string): BackendApiClient {
    const config = new ConfigUtils(userKey);
    return new BackendApiClient(config);
  }
}
