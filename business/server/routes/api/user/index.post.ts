import { UserController } from "@/_controllers/user";

export default defineEventHandler(async (event) => {
  return new UserController(event).create();
});
