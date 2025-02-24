import { PrismaClient } from "@prisma/client";
import { TUserSchema } from "@/entities/data/users";
import { UserServiceError } from "@/entities/errors/services";

import { prisma } from "@/lib/prisma";
import { db_createUser, db_deleteUser } from "@/utils/db";

export class UserService {
  private db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  async createUser(user: TUserSchema) {
    try {
      await db_createUser(this.db, user);
    } catch (error) {
      throw new UserServiceError("CREATE", error, { input: user });
    }
  }

  async deleteUser(id: TUserSchema["id"]) {
    try {
      await db_deleteUser(this.db, id);
    } catch (error) {
      throw new UserServiceError("DELETE", error, { data: { id } });
    }
  }
}
