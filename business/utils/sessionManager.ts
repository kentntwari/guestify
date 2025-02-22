import type { Redis } from "@upstash/redis";
import type { SessionManager } from "@kinde-oss/kinde-typescript-sdk";

import { destr } from "destr";

export class RedisBasedSessionManager implements SessionManager {
  private redis: Redis;
  private sessionId: string;
  private sessionPrefix: string = "kinde";

  constructor(redisInstance: Redis, sessionId: string) {
    this.redis = redisInstance;
    this.sessionId = sessionId;
  }

  private get sessionKey() {
    return `${this.sessionPrefix}:${this.sessionId}`;
  }

  async getSessionItem<T = unknown>(field: string): Promise<T | null> {
    const value = await this.redis.hget(this.sessionKey, field);
    return value ? destr(value) : null;
  }

  async setSessionItem<T = unknown>(
    itemKey: string,
    itemValue: T
  ): Promise<void> {
    await this.redis.hset(this.sessionKey, {
      [itemKey]: JSON.stringify(itemValue),
    });
    await this.redis.expire(this.sessionKey, 60 * 60 * 24 * 7); //expire in 7 days
  }

  async removeSessionItem(field: string): Promise<void> {
    await this.redis.hdel(this.sessionKey, field);
  }

  async destroySession(): Promise<void> {
    await this.redis.del(this.sessionKey);
  }
}
