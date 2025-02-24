import { kindeClient } from "@/lib/kinde";
import { RegisterError } from "@/entities/errors/auth";

export default defineEventHandler(async (event) => {
  try {
    const registerUrl = await kindeClient.register(event.context.session);
    return sendRedirect(event, registerUrl.toString());
  } catch (error) {
    throw new RegisterError();
  }
});
