import { PrismaClient } from "@prisma/client";

import { TUserSchema } from "@/entities/data/users";

export function db_createUser(dbLayer: PrismaClient, newUser: TUserSchema) {
  return dbLayer.user.create({
    data: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    },
  });
}

export function db_deleteUser(dbLayer: PrismaClient, id: TUserSchema["id"]) {
  return dbLayer.user.delete({
    where: { id },
  });
}
