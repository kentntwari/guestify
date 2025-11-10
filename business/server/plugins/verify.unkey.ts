import { UnkeyService } from "@/_services/unkey";
import { NetworkError } from "@/errors/network";

declare module "h3" {
  interface H3EventContext {
    isUserVerified: boolean;
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    const authHeader =
      getRequestHeaders(event)["authorization"] ||
      getRequestHeaders(event)["Authorization"];

    if (!authHeader)
      throw new NetworkError("Authorization header is missing", 401);

    const [scheme, userKey] = authHeader.split(" ");

    if (scheme !== "Bearer")
      throw new NetworkError("Invalid authorization format", 400);

    const res = await new UnkeyService().verifyUnkeyUserKey(userKey);

    if (!res.success) event.context.isUserVerified = false;
    else event.context.isUserVerified = true;
  });
});
