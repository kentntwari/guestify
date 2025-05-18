import { H3Error } from "h3";

export class NetworkError extends H3Error {
  constructor(
    message: string = "An unexpected network error has occurred.",
    code: number = 500,
    data: {} = {}
  ) {
    super(message);

    this.name = "NETWORK ERROR";
    this.statusCode = code;
    this.fatal = true;
    this.data = data;
  }
}
