import { kindeClient } from "@/lib/kinde";

export default defineEventHandler(async (event) => {
  const isAuthenticated = await kindeClient.isAuthenticated(
    event.context.session
  );

  if (!isAuthenticated) return { isAuthenticated: false };

  const profile = await kindeClient.getUserProfile(event.context.session);

  return {
    isAuthenticated,
    profile,
  };
});
