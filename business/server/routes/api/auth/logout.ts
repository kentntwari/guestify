import { kindeClient } from "@/lib/kinde";
import { LogoutError } from "@/entities/errors/auth";

export default defineEventHandler(async (event) => {
  try {
    const logoutUrl = await kindeClient.logout(event.context.session);
    return sendRedirect(event, logoutUrl.toString());
  } catch (error) {
    throw new LogoutError();
  }
});
