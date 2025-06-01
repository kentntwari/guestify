import { UnkeyController } from "@/controllers/unkey";
import { UnkeyFactory } from "@/factory/unkey";

declare module "h3" {
  interface H3EventContext {
    isUserVerified: boolean;
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    const res = await new UnkeyController(event).verify(
      UnkeyFactory.parseAuthorizationHeader(getRequestHeaders(event))["key"] ??
        ""
    );

    if (!res.success) event.context.isUserVerified = false;
    else event.context.isUserVerified = true;
  });
});
