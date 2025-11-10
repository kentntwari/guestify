import { Plan, Event } from "@prisma/client";
import { TUserSchema } from "@/utils/schemas.zod";
import { UserEntity } from "@/_entities/user";

import { Base as BaseMapper } from "./_base";

interface IUserDTO extends TUserSchema {}
export class UserMapper extends BaseMapper {
  static toDTO(user: UserEntity): IUserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.profilePicture,
    };
  }
}
