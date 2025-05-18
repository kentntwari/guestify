export class NetworkError extends Error {
  public resolution: string = "";
  public _origin: unknown;
  public context: {} = {};
  protected _isDevMode: boolean = process.env.NODE_ENV !== "production";

  constructor(
    message: string = "An unexpected network error has occurred.",
    context: {} = {},
    origin: unknown
  ) {
    super(message);

    this.name = "NETWORK ERROR";
    this.context = this._isDevMode ? context : {};
    this._origin = this._isDevMode ? origin : undefined;
  }
}
