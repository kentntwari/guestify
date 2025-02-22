import { kindeClient } from "@/lib/kinde";

export default defineEventHandler(async (event) => {
  try {
    const loginUrl = await kindeClient.login(event.context.session);
    return sendRedirect(event, loginUrl.toString());
  } catch (error) {
    //Must throw auth error
    console.log(error);
  }
});
