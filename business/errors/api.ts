import { H3Error } from "h3";

type TApi = "PERMISSIONS" | "USER" | "WEBHOOK";

export class ApiError extends H3Error {
  public rawError: unknown;

  constructor(api: TApi, error: unknown, data?: {}) {
    super("unknown " + api + "api error");

    this.name = api + "API ERROR";
    this.statusCode = 500;
    this.rawError = error;
    this.data = data;
  }
}
