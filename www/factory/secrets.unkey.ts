import { UnkeyApiClient } from "client/unkey";
import { ApplicationError } from "errors/application";
import { UnkeyCreateKeyResponseSchema } from "utils/schemas.zod";

export class UnkeySecretsFactory {
  static exposeCreateKeyApiClient() {
    return new UnkeyApiClient("CREATE_KEY");
  }

  static validateCreatedKey(
    rawKey: Awaited<ReturnType<UnkeyApiClient["create"]>>
  ) {
    const { success, error, data } =
      UnkeyCreateKeyResponseSchema.safeParse(rawKey);
    if (!success) throw new UnkeySecretsFactoryError(error.message, error);
    return data;
  }
}

export class UnkeySecretsFactoryError extends ApplicationError {
  constructor(message: string, error: unknown) {
    super(message, { error }, "factory/secrets.unkey");

    this.name = "UNKEY SECRETS FACTORY ERROR";
    console.log(this);
  }
}
