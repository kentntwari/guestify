import type { H3Event } from "h3";

import { ZodError } from "zod";

import { Base as BaseController } from "./_base";

import { UnkeyEntity } from "@/entities/unkey";

import { UnkeyService } from "@/services/unkey";

export class UnkeyController extends BaseController {
  constructor(
    event: H3Event,
    public unkeyService: UnkeyService = new UnkeyService()
  ) {
    super(event);
  }

  public async get() {}
  public async create() {}
  public async update() {}
  public async delete() {}

  async verify(userKey: string) {
    try {
      const res = await this.unkeyService.verifyUnkeyUserKey(userKey);

      if (res instanceof UnkeyEntity) {
        appendHeaders(this.nitroEvent, {
          "x-user-verified": "true",
          "x-unkey-id": res["id"],
        });
        return { success: true, error: null, data: res };
      }

      appendHeader(this.nitroEvent, "x-user-verified", "false");
      return { success: false, error: res.error, data: null };
    } catch (error) {
      return this.mapErrorResponse(error);
    }
  }

  public mapErrorResponse(error: unknown) {
    console.log(error);
    return {
      success: false,
      error:
        error instanceof ZodError
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : JSON.stringify(error),
      data: JSON.stringify(error),
    };
  }
}
