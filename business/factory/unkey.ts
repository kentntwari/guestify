import { UnkeyEntity } from "@/entities/unkey";

import { NetworkError } from "@/errors/network";

import { verifyUnkeyResponseSchema } from "@/utils/schemas.zod";

export class UnkeyFactory {
  static parseAuthorizationHeader(headers: ReturnType<typeof getRequestHeaders>) {
    const authHeader = headers["authorization"] || headers["Authorization"];

    if (!authHeader)
      throw new NetworkError("Authorization header is missing", 401);

    const [scheme, apiKey] = authHeader.split(" ");

    if (scheme !== "Bearer")
      throw new NetworkError("Invalid authorization format", 400);

    return new UnkeyEntity("", apiKey, [], []);
  }

  static validateKey(
    data: unknown
  ): UnkeyEntity | { error: "Invalid key" } | { error: "failed validation" } {
    const parsed = verifyUnkeyResponseSchema.safeParse(data);
    if (!parsed.success) return { error: "failed validation" };
    if (!parsed.data.valid) return { error: "Invalid key" };
    return new UnkeyEntity(
      parsed.data.keyId,
      undefined,
      parsed.data.roles,
      parsed.data.permissions
    );
  }
}
