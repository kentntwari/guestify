import { kindeClient } from "@/lib/kinde";

export default defineEventHandler(async (event) => {
  try {
    const registerUrl = await kindeClient.register(event.context.session);
    return sendRedirect(event, registerUrl.toString());
  } catch (error) {
    //muast throw auth error
    console.log(error);
  }
});
