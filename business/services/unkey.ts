import { UnkeyFactory } from "@/factory/unkey";
import { Base as BaseService } from "./_base";

import { ApplicationError } from "@/errors/application";

export class UnkeyService extends BaseService<UnkeyServiceError> {
  constructor(
    private unkeyApiUrl: string = "https://api.unkey.dev/v1/keys.verifyKey"
  ) {
    super();
  }

  async verifyUnkeyUserKey(
    key: string,
    apiId: string = process.env.UNKEY_API_ID || ""
  ) {
    const res = await $fetch(this.unkeyApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UNKEY_ROOT_KEY}`,
      },
      body: {
        key,
        apiId,
      },
    });

    return UnkeyFactory.validateKey(res);
  }

  protected mapError(error: unknown) {
    switch (true) {
      case error instanceof UnkeyServiceError:
        throw error;

      default:
        throw new UnkeyServiceError(JSON.stringify(error), 500);
    }
  }
}

export class UnkeyServiceError extends ApplicationError {
  constructor(message: string, code: number, data: object = {}) {
    super(message, code, true, data);

    this.name = "UNKEY SERVICE ERROR";
  }
}
