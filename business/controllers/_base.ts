import { H3Event } from "h3";
import { z } from "zod";

import { apiResponseSchema } from "@/utils/schemas.zod";

export abstract class Base {
  protected _nitroEvent: H3Event;
  protected _httpRequest: H3Event["node"]["req"];

  constructor(event: H3Event) {
    this._nitroEvent = event;
    this._httpRequest = event.node.req;
  }

  public get nitroEvent() {
    return this._nitroEvent;
  }

  public get httpRequest() {
    return this._httpRequest;
  }

  protected abstract mapErrorResponse(
    error: unknown
  ): void | z.infer<typeof apiResponseSchema>;
}
