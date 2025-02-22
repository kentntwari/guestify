import { kindeClient } from "@/lib/kinde";

export default defineEventHandler(async (event) => {
  try {
    const url = getRequestURL(event);
    await kindeClient.handleRedirectToApp(event.context.session, url);
    return sendRedirect(event, "/");
  } catch (error) {
    // throw callback error
    console.log("CALLBACK ERROR");
  }
});
