import { UnkeyEntity } from "@/_entities/unkey";
import { ApplicationError } from "@/errors/application";
import { NetworkError } from "@/errors/network";

import { verifyUnkeyResponseSchema } from "@/utils/schemas.zod";

export class UnkeyFactory {
  static parseAuthorizationHeader(
    headers: ReturnType<typeof getRequestHeaders>
  ) {
    const authHeader = headers["authorization"] || headers["Authorization"];

    if (!authHeader)
      throw new NetworkError("Authorization header is missing", 401);

    const [scheme, userKey] = authHeader.split(" ");

    if (scheme !== "Bearer")
      throw new NetworkError("Invalid authorization format", 400);

    return new UnkeyEntity("", userKey, [], []);
  }

  static validateKey(data: unknown): UnkeyEntity {
    const parsed = verifyUnkeyResponseSchema.safeParse(data);
    if (!parsed.success)
      throw new UnkeyFactoryError(
        "Failed to parse unkey response",
        parsed.error
      );
    if (!parsed.data.valid) throw new UnkeyFactoryError("Invalid key");
    return new UnkeyEntity(
      parsed.data.keyId,
      undefined,
      parsed.data.roles,
      parsed.data.permissions
    );
  }
}

export class UnkeyFactoryError extends ApplicationError {
  constructor(message: string, public error: unknown = null) {
    super(message);
    this.name = "UNKEY FACTORY ERROR";
    this.fatal = false;
    this.cause = { error };
  }
}
