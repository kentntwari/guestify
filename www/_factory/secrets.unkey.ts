import { UnkeyApiClient } from "_client/unkey";
import { ApplicationError } from "errors/application";
import { UnkeyCreateKeyResponseSchema } from "utils/schemas.zod";
import { UnkeySecretEntity } from "_entities/secrets.unkey";
import { ConfigUtils } from "utils/config";

export class UnkeySecretsFactory {
  static toCreateKeyApiClient() {
    if (!process.env.UNKEY_ROOT_KEY)
      throw new ApplicationError(
        "Missing root key secret.",
        {},
        "factory/secrets.unkey"
      );

    return new UnkeyApiClient(
      "CREATE_KEY",
      new ConfigUtils(process.env.UNKEY_ROOT_KEY)
    );
  }

  static toEntity(rawKey: unknown) {
    const { success, error, data } =
      UnkeyCreateKeyResponseSchema.safeParse(rawKey);
    if (!success) throw new UnkeySecretsFactoryError(error.message, error);
    return new UnkeySecretEntity(data.keyId, data.key);
  }
}

export class UnkeySecretsFactoryError extends ApplicationError {
  constructor(message: string, error: unknown) {
    super(message, { error }, "factory/secrets.unkey");

    this.name = "UNKEY SECRETS FACTORY ERROR";
    console.log(this);
  }
}
