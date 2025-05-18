import { NetworkError } from "errors/network";

export abstract class Base {
  private _eventRequest: Request;

  constructor(req: Request) {
    this._eventRequest = req;
  }

  protected get request() {
    return this._eventRequest;
  }

  protected async getBody() {
    try {
      return await this._eventRequest.json();
    } catch (error) {
      throw new NetworkError(
        "Failed to parse request body",
        { request: JSON.stringify(this._eventRequest), error },
        "controllers/_base"
      );
    }
  }

  protected abstract mapErrorResponse(error: unknown): Response;
}
