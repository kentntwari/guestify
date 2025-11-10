import { Base as BaseService, type IBaseService } from "_services/_base";

import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";

import {
  UnkeySecretsFactory,
  UnkeySecretsFactoryError,
} from "_factory/secrets.unkey";

import { UnkeySecretsMapper } from "_mapper/secrets.unkey";

export interface IUnkeySecretService
  extends IBaseService<{}, UnkeySecretsMapper> {
  generate(userId: string, metadata?: {}): Promise<UnkeySecretsMapper>;
}

export class UnkeySecretService
  extends BaseService
  implements IUnkeySecretService
{
  constructor(
    private readonly UNKEY_API_ID: string = process.env.UNKEY_API_ID || ""
  ) {
    super();
    if (!this.UNKEY_API_ID || this.UNKEY_API_ID === "")
      throw new UnkeySecretServiceError("Missing API ID secret.");
  }

  public async generate(userId: string, metadata: {} = {}) {
    try {
      const key = await UnkeySecretsFactory.toCreateKeyApiClient().create(
        UnkeySecretsMapper.toCreateKeyDTO(userId, this.UNKEY_API_ID, metadata)
      );
      return UnkeySecretsMapper.toResultSuccess(
        "created",
        UnkeySecretsFactory.toEntity(key)
      );
    } catch (error) {
      // TODO: log error properly
      return UnkeySecretsMapper.toResultError(
        this.mapError(error, { userId, metadata })
      );
    }
  }

  protected mapError(error: unknown, meta: {} = {}) {
    switch (true) {
      case error instanceof UnkeySecretServiceError ||
        error instanceof ApplicationError ||
        error instanceof NetworkError:
        return error;

      case error instanceof UnkeySecretsFactoryError:
        return new UnkeySecretServiceError(error.message, error);

      default:
        return new UnkeySecretServiceError(
          "Unexpected error occured in UnkeySecretService class",
          error
        );
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
