import { kindeClient } from "@/lib/kinde";
import { LoginError } from "@/entities/errors/auth";

export default defineEventHandler(async (event) => {
  try {
    const loginUrl = await kindeClient.login(event.context.session);
    return sendRedirect(event, loginUrl.toString());
  } catch (error) {
    throw new LoginError();
  }
});
