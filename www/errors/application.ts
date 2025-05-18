export class ApplicationError extends Error {
  public context = {};
  public resolution: string = "";
  protected _isDevMode: boolean = process.env.NODE_ENV !== "production";

  constructor(message: string, context: {} = {}, origin: string = "") {
    super(message);

    this.name = "APPLICATION ERROR";
    this.context = this._isDevMode ? context : {};
  }
}
