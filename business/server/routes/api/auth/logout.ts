import { kindeClient } from "@/lib/kinde";

export default defineEventHandler(async (event) => {
  try {
      const logoutUrl = await kindeClient.logout(event.context.session);
  return sendRedirect(event, logoutUrl.toString());
  } catch (error) {
    //muast throw auth error
    console.log(error);
  }

});
