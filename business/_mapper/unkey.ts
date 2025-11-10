import { UnkeyEntity } from "@/_entities/unkey";
import { Base as BaseMapper } from "./_base";

export interface IUnkeyDTO {
  id: string;
  roles?: string[];
  permissions?: string[];
}

export class UnkeyMapper extends BaseMapper {
  static toDTO(entity: UnkeyEntity): IUnkeyDTO {
    return {
      id: entity.id,
      roles: entity.roles,
      permissions: entity.permissions,
    };
  }
}
