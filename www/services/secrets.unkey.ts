import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";

import {
  UnkeySecretsFactory,
  UnkeySecretsFactoryError,
} from "factory/secrets.unkey";

import { UnkeySecretsDTO } from "dto/secrets.unkey";

export class UnkeySecretService {
  constructor() {
    if (!process.env.UNKEY_API_ID)
      throw new UnkeySecretServiceError("Missing API ID secret.");
  }

  public async generate(userId: string, metadata: {} = {}) {
    try {
      const key = await UnkeySecretsFactory.exposeCreateKeyApiClient().create(
        UnkeySecretsDTO.createKey(userId, metadata)
      );
      return UnkeySecretsFactory.validateCreatedKey(key);
    } catch (error) {
      switch (true) {
        case error instanceof ApplicationError:
          throw error;

        case error instanceof NetworkError:
          throw error;

        case error instanceof UnkeySecretServiceError:
          throw error;

        case error instanceof UnkeySecretsFactoryError:
          throw new UnkeySecretServiceError(
            "Unkey secret generation failed",
            error
          );

        default:
          throw new ApplicationError(
            "Unexpected error occured in UnkeySecretService class",
            {
              userId,
              error,
            },
            "services/unkey.secret"
          );
      }
    }
  }
}

export class UnkeySecretServiceError extends ApplicationError {
  constructor(message: string, rawError: unknown = null) {
    super(message);
    this.name = "UNKEY SECRETS ERROR";
    if (!rawError)
      this.resolution = this._isDevMode
        ? "Please make sure all your secrets such as the root key and API id are set in your environment variables."
        : "Contact the development team for support";
    if (rawError) {
      this.context = this._isDevMode ? rawError : {};
      this.resolution = this._isDevMode
        ? "Please refer to the unkey documentation for more information about this error"
        : "Contact the development team for support";
    }
  }
}
