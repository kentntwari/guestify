import { UserEntity } from "_entities/user";
import { type TResultWrapper, type TResultStatus, BaseMapper } from "./_base";

export interface IUnkeyCreateKeyDTO {
  name: `guestify_${string}`;
  apiId: string;
  externalId: string;
  roles?: string[];
  permissions?: string[];
  meta?: {};
  byteLength?: number;
}

export class UnkeySecretsMapper extends BaseMapper {
  static toCreateKeyDTO(
    userId: string,
    unkeyApiId: string,
    metadata: {} = {}
  ): IUnkeyCreateKeyDTO {
    return {
      name: `guestify_${userId}`,
      apiId: unkeyApiId,
      externalId: userId,
      roles: UserEntity.newUser().roles,
      permissions: UserEntity.newUser().permissions,
      meta: metadata,
    };
  }
}
