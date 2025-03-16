import { kindeClient } from "@/lib/kinde";
import { CallbackError } from "@/entities/errors/auth";

export default defineEventHandler(async (event) => {
  try {
    const url = getRequestURL(event);
    await kindeClient.handleRedirectToApp(event.context.session, url);
    return sendNoContent(event, 204);
  } catch (error) {
    throw new CallbackError();
  }
});
