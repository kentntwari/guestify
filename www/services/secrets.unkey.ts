import { UnkeyApiClient } from "client/unkey";
import { z } from "zod";

import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";
import { UserEntity } from "entities/user";

import {
  UnkeyCreateKeyRequestOptionsSchema,
  UnkeyCreateKeyResponseSchema,
} from "utils/schemas.zod";

type TUnkeyCreateKeyRequestOptions = z.infer<
  typeof UnkeyCreateKeyRequestOptionsSchema
>;

export class UnkeySecretService {
  protected _userEntity: UserEntity;
  protected _secret_api_id: string;
  protected _client: UnkeyApiClient | undefined;

  constructor() {
    if (!process.env.UNKEY_API_ID)
      throw new UnkeySecretServiceError("Missing API ID secret.");

    this._secret_api_id = process.env.UNKEY_API_ID;
    this._userEntity = new UserEntity();
  }

  public async generate(userId: string, metadata: {} = {}) {
    try {
      this._client = new UnkeyApiClient("CREATE_KEY");
      const res = await this._client.create({
        name: "guestify_" + userId,
        apiId: this._secret_api_id,
        externalId: userId,
        roles: this._userEntity.newUser.roles,
        permissions: this._userEntity.newUser.permissions,
        meta: metadata,
      } satisfies TUnkeyCreateKeyRequestOptions);

      const { success, error, data } =
        UnkeyCreateKeyResponseSchema.safeParse(res);

      if (!success) throw new UnkeySecretServiceError(error.message, error);

      return data;
    } catch (error) {
      switch (true) {
        case error instanceof NetworkError:
          throw error;

        case error instanceof UnkeySecretServiceError:
          throw error;

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
