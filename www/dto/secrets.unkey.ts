import type { TUnkeyCreateKeyRequestOptions } from "utils/schemas.zod";

import { UserEntity } from "entities/user";

export class UnkeySecretsDTO {
  static createKey(userId: string, metadata: {} = {}) {
    return {
      name: "guestify_" + userId,
      apiId: process.env.UNKEY_API_ID || "",
      externalId: userId,
      roles: UserEntity.newUser().roles,
      permissions: UserEntity.newUser().permissions,
      meta: metadata,
    } satisfies TUnkeyCreateKeyRequestOptions;
  }
}
