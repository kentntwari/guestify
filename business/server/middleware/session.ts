import { RedisBasedSessionManager } from "@/utils/sessionManager";

import { nanoid } from "nanoid";
import { redis } from "@/lib/redis";

declare module "h3" {
  interface H3EventContext {
    session: RedisBasedSessionManager;
  }
}

const SESSION_KEY = "kinde";

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, SESSION_KEY) || nanoid(60);
  const sessionManager = new RedisBasedSessionManager(redis, sessionId);

  event.context.session = sessionManager;

  if (!getCookie(event, SESSION_KEY)) {
    setCookie(event, SESSION_KEY, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }
});
