import { kindeClient } from "@/lib/kinde";
import { CallbackError } from "@/entities/errors/auth";

export default defineEventHandler(async (event) => {
  try {
    const url = getRequestURL(event);
    await kindeClient.handleRedirectToApp(event.context.session, url);
    return sendRedirect(event, url.toString());
  } catch (error) {
    throw new CallbackError();
  }
});
