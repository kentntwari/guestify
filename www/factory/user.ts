import { BackendApiClient } from "client/backend";

import { ApplicationError } from "errors/application";
import { ConfigUtils } from "utils/config";

export class UserFactory {
  static prepareClient(userKey: string) {
    try {
      return new BackendApiClient(new ConfigUtils(userKey));
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
    console.log(this);
  }
}
