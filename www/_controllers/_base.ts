import { NetworkError } from "errors/network";
import { redirect } from "react-router";

// TODO: implement response strategy following the link below:
// https://tutorialstrend.com/tutorials/mvc/MVC-returntype
interface ISuccessResponse extends Response {}
interface IJsonResponse extends Response {}
interface ITextResponse extends Response {}
interface IRedirectResponse extends Response {}
interface INotFoundResponse extends Response {}
interface IBadRequestResponse extends Response {}
interface IStatusResponse extends Response {}

export class RedirectResponse extends Response implements IRedirectResponse {
  constructor(url: string, status: number = 302, headers: HeadersInit = {}) {
    super(null, {
      status,
      headers: { Location: url, ...headers },
    });

    throw redirect(url);
  }
}

export class StatusResponse extends Response implements IStatusResponse {
  constructor(message: string, status: number, headers: HeadersInit = {}) {
    super(message, {
      status,
      headers: { "Content-Type": "text/plain", ...headers },
    });
  }
}

export class SuccessResponse extends Response implements ISuccessResponse {
  constructor(
    message: string,
    status: number = 200,
    headers: HeadersInit = {}
  ) {
    super(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }
}

export class NotFoundResponse extends Response implements INotFoundResponse {
  constructor(
    message: string,
    status: number = 404,
    headers: HeadersInit = {}
  ) {
    super(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }
}

export class BadRequestResponse
  extends Response
  implements IBadRequestResponse
{
  constructor(
    message: string,
    status: number = 400,
    headers: HeadersInit = {}
  ) {
    super(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }
}

export class TextResponse extends Response implements ITextResponse {
  constructor(
    message: string,
    status: number = 200,
    headers: HeadersInit = {}
  ) {
    super(message, {
      status,
      headers: { "Content-Type": "text/plain", ...headers },
    });
  }
}

export class JsonResponse extends Response implements IJsonResponse {
  constructor(data: any, status: number = 200, headers: HeadersInit = {}) {
    super(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }
}

export abstract class Base {
  private readonly _eventRequest: Request;

  constructor(req: Request) {
    this._eventRequest = req;
    this.logRequest();
  }

  protected get request(): Request {
    return this._eventRequest;
  }

  protected get method(): string {
    return this._eventRequest.method;
  }

  protected get url(): string {
    return this._eventRequest.url;
  }

  protected get headers(): Headers {
    return this._eventRequest.headers;
  }

  protected async getBody<T = any>(
    type: "json" | "text" | "form" = "json"
  ): Promise<T> {
    try {
      switch (type) {
        case "json":
          return await this._eventRequest.json();
        case "text":
          return (await this._eventRequest.text()) as unknown as T;
        case "form":
          return Object.fromEntries(
            await this._eventRequest.formData()
          ) as unknown as T;
        default:
          throw new NetworkError(
            "Unsupported body type",
            {},
            "controllers/_base"
          );
      }
    } catch (error) {
      this.logError(error, "Failed to parse request body");
      throw new NetworkError(
        "Failed to parse request body",
        { request: JSON.stringify(this._eventRequest), error },
        "controllers/_base"
      );
    }
  }

  protected logRequest(): void {
    const headersObj = Object.fromEntries(this.headers.entries());
    console.log(`[BaseController] ${this.method} ${this.url}`);
    console.log(`[BaseController] Headers:`, headersObj);
  }

  // Todo: implement sentry and posthog
  protected logError(error: unknown, context?: string): void {}

  protected validateHeaders(required: string[], errorMsg?: string): void {
    for (const key of required) {
      if (!this.headers.get(key)) {
        throw new NetworkError(
          errorMsg || `Missing required header: ${key}`,
          {},
          "controllers/_base"
        );
      }
    }
  }

  protected validateMethod(allowed: string[]): void {
    if (!allowed.includes(this.method.toUpperCase())) {
      throw new NetworkError(
        `Method ${this.method} not allowed`,
        {},
        "controllers/_base"
      );
    }
  }

  protected validateContentType(allowed: string[], errorMsg?: string): void {
    const contentType = this.headers.get("content-type");
    if (!contentType) {
      throw new NetworkError(
        errorMsg || "Missing Content-Type header",
        {},
        "controllers/_base"
      );
    }
    const matched = allowed.some((type) =>
      contentType.toLowerCase().includes(type.toLowerCase())
    );
    if (!matched) {
      throw new NetworkError(
        `Unsupported Content-Type: ${contentType}`,
        {},
        "controllers/_base"
      );
    }
  }

  protected async authenticate(): Promise<void> {}

  protected async authorize(): Promise<void> {}

  public abstract create(): Promise<
    JsonResponse | TextResponse | RedirectResponse | SuccessResponse
  >;
  public abstract update(): Promise<
    JsonResponse | TextResponse | RedirectResponse | SuccessResponse
  >;
  public abstract delete(): Promise<
    JsonResponse | TextResponse | RedirectResponse | SuccessResponse
  >;

  protected abstract sanitizeRequest(
    req: Request,
    ...args: any[]
  ): Promise<void> | void;

  protected abstract mapErrorResponse(
    error: unknown
  ): INotFoundResponse | IBadRequestResponse | IStatusResponse;
}
