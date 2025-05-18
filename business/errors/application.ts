import { H3Error } from "h3";

export class ApplicationError extends H3Error {
  constructor(
    message: string = "An unexpected application error has occurred.",
    code: number = 500,
    isFatal: boolean = true,
    data?: {}
  ) {
    super(message);

    this.name = "APPLICATION ERROR";
    this.statusCode = code;
    this.fatal = isFatal;
    this.data = data;
  }
}
