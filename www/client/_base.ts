import type { $Fetch } from "ofetch";

export abstract class Base {
  protected abstract _httpClient: $Fetch;
  protected abstract _baseUrl: string;

  public abstract get create(): {};
  public abstract get update(): {};
  public abstract get delete(): {};
}
