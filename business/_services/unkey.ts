import { UnkeyFactory, UnkeyFactoryError } from "@/_factories/unkey";
import { Base as BaseService } from "./_base";

import { ApplicationError } from "@/errors/application";
import { NetworkError } from "@/errors/network";
import { UnkeyMapper } from "@/_mapper/unkey";

export class UnkeyService extends BaseService<
  UnkeyServiceError | ReturnType<(typeof UnkeyMapper)["toResultError"]>
> {
  constructor(
    private unkeyApiUrl: string = "https://api.unkey.dev/v1/keys.verifyKey"
  ) {
    super();
  }

  async verifyUnkeyUserKey(
    key: string,
    apiId: string = process.env.UNKEY_API_ID || ""
  ) {
    try {
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

      return UnkeyMapper.toResultSuccess(UnkeyFactory.validateKey(res));
    } catch (error) {
      switch (true) {
        case error instanceof UnkeyFactoryError:
          return UnkeyMapper.toResultError("Factory error: " + error.message);

        case error instanceof ApplicationError || error instanceof NetworkError:
          throw error;

        default:
          return UnkeyMapper.toResultError(
            "Unexpected error occured in UnkeyService class"
          );
      }
    }
  }

  protected mapError(error: unknown) {
    switch (true) {
      case error instanceof UnkeyFactoryError:
        return UnkeyMapper.toResultError("Factory error: " + error.message);

      case error instanceof ApplicationError || error instanceof NetworkError:
        throw error;

      default:
        return UnkeyMapper.toResultError(
          "Unexpected error occured in UnkeyService class"
        );
    }
  }
}

export class UnkeyServiceError extends ApplicationError {
  constructor(message: string, data: object = {}) {
    super(message);

    this.name = "UNKEY SERVICE ERROR";
    this.data = data;
  }
}
