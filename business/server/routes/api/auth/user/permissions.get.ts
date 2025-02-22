import { kindeClient } from "@/lib/kinde";

export default defineEventHandler(async (event) => {
  const isAuthenticated = await kindeClient.isAuthenticated(
    event.context.session
  );

  if (!isAuthenticated) return null;

  const permissions = await kindeClient.getPermissions(event.context.session);

  return permissions;
});
