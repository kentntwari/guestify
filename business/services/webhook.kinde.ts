import {
  WebhookEventType,
  UserCreatedWebhookEvent,
} from "@/types/kinde/webhooks";

import { z } from "zod";
import { H3Event } from "h3";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import { kindeClient } from "@/lib/kinde";
import { NetworkError } from "@/entities/errors/network";
import { KindeWebhookError } from "@/entities/errors/webhooks";
import { ApplicationError } from "@/entities/errors/application";
import { RedisBasedSessionManager } from "@/utils/sessionManager";

abstract class BaseWebhookService {
  private readonly _event: H3Event;
  private readonly _session: RedisBasedSessionManager;

  constructor(event: H3Event) {
    this._event = event;
    this._session = this._event.context.session;
  }

  protected get session() {
    return this._session;
  }

  protected getContentType() {
    const contentType = getRequestHeader(this._event, "content-type");
    if (contentType !== "application/jwt")
      throw new KindeWebhookError({ webhooktype: undefined }, contentType);
    return contentType;
  }

  protected async getToken() {
    const token = await readRawBody(this._event, "utf-8");

    if (Buffer.isBuffer(token)) token.toString();
    else if (typeof token === "string") token;
    else
      throw new KindeWebhookError(
        {
          webhooktype: undefined,
          token: z.coerce.string().parse(token),
        },
        this.getContentType()
      );

    return token;
  }

  public abstract isAuthenticated(): Promise<boolean>;
}

export class KindeWebhookService extends BaseWebhookService {
  private _kindeClient: typeof kindeClient;
  private _kindeClientInitialized: boolean = false;
  protected _kindeWebhookTokenDecoded: jwt.Jwt | null = null;
  protected _kindeWebhookSigningKey: jwksClient.SigningKey | undefined;
  protected _kindeWebhookType: WebhookEventType | undefined;
  protected _kindeWebhookPayload: jwt.JwtPayload | string | undefined;
  protected _kindeWebhookJwksClient: jwksClient.JwksClient;

  constructor(event: H3Event, kinde: typeof kindeClient = kindeClient) {
    super(event);

    this._kindeClient = kinde;
    this._kindeWebhookJwksClient = jwksClient({
      jwksUri: `${process.env.KINDE_AUTH_DOMAIN}/.well-known/jwks.json`,
    });
  }

  protected async prepare() {
    try {
      if (this._kindeClientInitialized) return this._kindeClient;

      await this._kindeClient;
      this._kindeClientInitialized = true;
      return this._kindeClient;
    } catch (error) {
      throw new NetworkError("Unable to initialize kinde client", 500, {
        session: super.session,
        isKindeInitialized: this._kindeClientInitialized,
        rawError: error,
      });
    }
  }

  public async isAuthenticated() {
    try {
      return (await this.prepare()).isAuthenticated(super.session);
    } catch (error) {
      throw new ApplicationError("Unable to check authentication", 500, true, {
        session: super.session,
        isKindeInitialized: this._kindeClientInitialized,
        rawError: error,
      });
    }
  }

  public async getUserProfile() {
    try {
      return (await this.prepare()).getUserProfile(super.session);
    } catch (error) {
      throw new ApplicationError(
        "An error occured while retrieving the user profile",
        500,
        true,
        {
          session: super.session,
          isKindeInitialized: this._kindeClientInitialized,
          rawError: error,
        }
      );
    }
  }

  public async getAllPermissions() {
    try {
      const prepared = await this.prepare();
      const isAuthenticated = await prepared.isAuthenticated(super.session);

      if (!isAuthenticated) return null;

      return prepared.getPermissions(super.session);
    } catch (error) {
      if (error instanceof NetworkError) throw error;
      throw new ApplicationError(
        "An error occured while retrieving permissions",
        500,
        false,
        {
          session: super.session,
          isKindeInitialized: this._kindeClientInitialized,
          rawError: error,
        }
      );
    }
  }

  protected async getDecodedToken() {
    const rawToken = await super.getToken();

    if (!rawToken)
      throw new KindeWebhookError(
        {
          webhooktype: undefined,
          token: z.coerce.string().parse(rawToken),
        },
        super.getContentType()
      );

    this._kindeWebhookTokenDecoded = jwt.decode(rawToken, {
      complete: true,
    });

    if (!this._kindeWebhookTokenDecoded)
      throw new KindeWebhookError(
        {
          webhooktype: undefined,
          token: rawToken,
        },
        super.getContentType(),
        {
          details: "Expected valid JWT decoded token, got invalid token",
          decodedToken: z.coerce.string().parse(this._kindeWebhookTokenDecoded),
        }
      );

    return this._kindeWebhookTokenDecoded;
  }

  private async getSigningKey() {
    try {
      const { kid } = (await this.getDecodedToken()).header;
      this._kindeWebhookSigningKey =
        await this._kindeWebhookJwksClient.getSigningKey(kid);
      return this._kindeWebhookSigningKey.getPublicKey();
    } catch (error) {
      if (error instanceof KindeWebhookError) throw error;
      throw new ApplicationError(
        "An error occured while retrieving the signing key",
        500,
        true,
        {
          session: super.session,
          isKindeInitialized: this._kindeClientInitialized,
          decodedToken: z.coerce.string().parse(this._kindeWebhookTokenDecoded),
          rawError: error,
        }
      );
    }
  }

  public async getWebhookPayload() {
    try {
      const rawToken = await super.getToken();
      const signingKey = await this.getSigningKey();

      this._kindeWebhookPayload = jwt.verify(rawToken, signingKey);

      if (typeof this._kindeWebhookPayload === "string")
        throw new KindeWebhookError(
          {
            webhooktype: undefined,
            token: z.coerce.string().parse(rawToken),
          },
          super.getContentType(),
          {
            details: "Expected webhook payload but received string",
            payload: this._kindeWebhookPayload,
            decodedToken: z.coerce
              .string()
              .parse(this._kindeWebhookTokenDecoded),
            signingKey: this._kindeWebhookSigningKey,
          }
        );

      return this._kindeWebhookPayload as UserCreatedWebhookEvent;
    } catch (error) {
      if (error instanceof KindeWebhookError) throw error;
      throw new ApplicationError(
        "An error occured while verifying the token",
        500,
        true,
        {
          session: super.session,
          isKindeInitialized: this._kindeClientInitialized,
          decodedToken: z.coerce.string().parse(this._kindeWebhookTokenDecoded),
          signingKey: this._kindeWebhookSigningKey,
          rawError: error,
        }
      );
    }
  }

  public async getWebhookType() {
    try {
      const payload = await this.getWebhookPayload();

      if ("type" in payload) {
        this._kindeWebhookType = payload.type as WebhookEventType;
        return this._kindeWebhookType;
      }

      throw new KindeWebhookError(
        { webhooktype: undefined },
        super.getContentType(),
        {
          details: 'unable to find "type"  property in payload',
          decodedToken: z.coerce.string().parse(this._kindeWebhookTokenDecoded),
          signingKey: this._kindeWebhookSigningKey,
          payload: z.coerce.string().parse(payload),
          webhookType: this._kindeWebhookType,
        }
      );
    } catch (error) {
      if (error instanceof KindeWebhookError) throw error;
      throw new ApplicationError(
        "An error occured while retrieving the webhook type",
        500,
        true,
        {
          session: super.session,
          isKindeInitialized: this._kindeClientInitialized,
          decodedToken: z.coerce.string().parse(this._kindeWebhookTokenDecoded),
          signingKey: this._kindeWebhookSigningKey,
          webhookType: this._kindeWebhookType,
          rawError: error,
        }
      );
    }
  }
}
