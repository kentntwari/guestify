import type { PrismaClient } from "@prisma/client";

import { H3Error } from "h3";

import type { TUserCreateSchema } from "@/utils/schemas.zod";

import { prisma } from "../lib/prisma";
import { DatabaseError } from "@/errors/database";

export class UserRepository {
  private _prismaClient: PrismaClient = prisma;

  constructor() {}

  public async create(data: TUserCreateSchema) {
    try {
      return await this._prismaClient.user.create({
        data: {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
        },
      });
    } catch (error) {
      throw new DatabaseError("CREATE", "USER", error);
    }
  }
}
