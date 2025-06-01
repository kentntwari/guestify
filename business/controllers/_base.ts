import { H3Event } from "h3";

import { type TApiResponseSchema } from "@/utils/schemas.zod";

export abstract class Base {
  private _nitroEvent: H3Event;
  private _httpRequest: H3Event["node"]["req"];

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

  public abstract get(...params: any): Promise<TApiResponseSchema | void>;
  public abstract create(...params: any): Promise<TApiResponseSchema | void>;
  public abstract update(...params: any): Promise<TApiResponseSchema | void>;
  public abstract delete(...params: any): Promise<TApiResponseSchema | void>;
  protected abstract mapErrorResponse(
    error: unknown
  ): void | TApiResponseSchema;
}
