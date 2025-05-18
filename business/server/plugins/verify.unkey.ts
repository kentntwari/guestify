import { UnkeyApiClient } from "@/client/unkey";

declare module "h3" {
  interface H3EventContext {
    isUserVerified: boolean;
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    const res = await new UnkeyApiClient().verify(
      getRequestHeaders(event)["x-unkey-secret"] ?? ""
    );

    if (!res.success) event.context.isUserVerified = false;
    else event.context.isUserVerified = true;
  });
});
