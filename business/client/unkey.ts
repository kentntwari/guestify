import { z, ZodError } from "zod";

import {
  verifyUnkeyResponseSchema,
  verifyUnkeyApiClientResponseSchema,
} from "@/utils/schemas.zod";

export class UnkeyApiClient {
  constructor(
    public apiUrl: string = "https://api.unkey.dev/v1/keys.verifyKey"
  ) {}

  async verify(
    key: string,
    apiId: string = process.env.UNKEY_API_ID || ""
  ): Promise<z.infer<typeof verifyUnkeyApiClientResponseSchema>> {
    try {
      const res = await $fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UNKEY_ROOT_KEY}`,
          "Content-Type": "application/json",
        },
        body: {
          key,
          apiId,
        },
      });

      console.log(res);

      const parsed = verifyUnkeyResponseSchema.safeParse(res);

      if (!parsed.success)
        return {
          success: false,
          error: parsed.error.message,
          data: parsed.error,
        };

      if (!parsed.data.valid)
        return { success: false, error: "Invalid key", data: null };

      return { success: true, error: null, data: parsed.data };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error:
          error instanceof ZodError ? error.message : JSON.stringify(error),
        data: JSON.stringify(error),
      };
    }
  }
}
