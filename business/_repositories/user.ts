import type { PrismaClient } from "@prisma/client";

import { H3Error } from "h3";

import type { TUserCreateSchema } from "@/utils/schemas.zod";

import { prisma } from "../lib/prisma";
import { DatabaseError } from "@/errors/database";
import { UserEntity } from "@/_entities/user";

export class UserRepository {
  private _prismaClient: PrismaClient = prisma;

  constructor() {}

  public async create(userEntity: UserEntity) {
    try {
      return await this._prismaClient.user.create({
        data: {
          id: userEntity.id,
          email: userEntity.email,
          firstName: userEntity.firstName,
          lastName: userEntity.lastName,
          imageUrl: userEntity.profilePicture,
          plan: userEntity["meta"].plan,
        },
        omit: {
          id: true,
        },
      });
    } catch (error) {
      throw new DatabaseError("CREATE", "USER", error);
    }
  }
}
