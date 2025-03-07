import { PrismaClient } from "@prisma/client";
import { TUserSchema } from "@/entities/data/users";
import { NetworkError } from "@/entities/errors/network";
import { ServiceError } from "@/entities/errors/services";

import { prisma } from "@/lib/prisma";

export class UserService {
  private _db: PrismaClient;
  private _dbInitialized: boolean = false;

  constructor(db: PrismaClient = prisma) {
    this._db = db;
  }

  async prepareDb() {
    try {
      if (this._dbInitialized) return this._db;

      await this._db.$connect();
      this._dbInitialized = true;

      return this._db;
    } catch (error) {
      throw new NetworkError("Failed to prepare database connection.", 500);
    }
  }

  async create(user: TUserSchema) {
    try {
      return (await this.prepareDb()).user.create({
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      if (error instanceof NetworkError) throw error;
      throw new ServiceError("USER", "CREATE", error, { input: user });
    }
  }

  async delete(id: TUserSchema["id"]) {
    try {
      return (await this.prepareDb()).user.delete({
        where: { id },
      });
    } catch (error) {
      throw new ServiceError("USER", "DELETE", error, { data: { id } });
    }
  }
}
