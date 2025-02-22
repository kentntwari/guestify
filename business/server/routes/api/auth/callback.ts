import { kindeClient } from "@/lib/kinde";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  await kindeClient.handleRedirectToApp(event.context.session, url);
  return sendRedirect(event, "/");
});
