import { Redis } from "@upstash/redis";
import type { TAppUserPlan } from "utils/schemas.zod";

type TCacheResult<T = unknown> = (...args: any[]) => Promise<{
  success: boolean;
  error: string | null;
  data?: T;
  metadata?: Record<string, string>;
}>;

interface ICacheHelper {
  read(key: string): Record<string, TCacheResult>;
  update(key: string, ttl: number): Record<string, TCacheResult>;
  delete(key: string): Record<string, TCacheResult>;
}

interface ICacheService extends Redis {
  getUserApiKey(key: string): ReturnType<TCacheResult>;
  setUserApiKey(...args: any): ReturnType<TCacheResult>;
  deleteKey(key: string): ReturnType<TCacheResult>;
}

class CacheService extends Redis implements ICacheService {
  constructor() {
    super({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
  }

  async getUserApiKey(key: string): ReturnType<ICacheService["getUserApiKey"]> {
    try {
      const value = await this.get<string>(key);
      return { success: true, error: null, data: value };
    } catch (error) {
      return {
        success: false,
        error: "Failed to read user API key",
        metadata: { error: JSON.stringify(error) },
      };
    }
  }

  async setUserApiKey(
    key: string,
    apiKey: string,
    plan: TAppUserPlan,
    ttl: number
  ): ReturnType<ICacheService["setUserApiKey"]> {
    try {
      await this.set(key, JSON.stringify({ apiKey, plan }), { ex: ttl });
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update user API key",
        metadata: { error: JSON.stringify(error) },
      };
    }
  }

  async deleteKey(key: string): ReturnType<ICacheService["deleteKey"]> {
    try {
      await this.del(key);
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete key",
        metadata: { error: JSON.stringify(error) },
      };
    }
  }
}

export class CacheHelper implements ICacheHelper {
  constructor(private cacheService: CacheService = new CacheService()) {}

  read(key: string) {
    return {
      userApiKey: () => this.cacheService.getUserApiKey(key),
    };
  }

  update(key: string, ttl: number) {
    return {
      userApiKey: (apiKey: string, plan: TAppUserPlan) =>
        this.cacheService.setUserApiKey(key, apiKey, plan, ttl),
    };
  }

  delete(key: string) {
    return {
      userApiKey: () => this.cacheService.deleteKey(key),
    };
  }
}
