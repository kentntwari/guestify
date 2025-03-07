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

export class KindeWebhookService {
  private _event: H3Event;
  private _session: RedisBasedSessionManager;
  private _kindeWebhookToken: string | undefined;
  private _kindeWebhookContentType: string | undefined;
  private _kindeWebhookTokenDecoded: jwt.Jwt | null = null;
  private _kindeWebhookSigningKey: jwksClient.SigningKey | undefined;
  private _kindeWebhookType: WebhookEventType | undefined;
  private _kindeWebhookPayload: jwt.JwtPayload | string | undefined;
  private _kindeWebhookJwksClient: jwksClient.JwksClient;

  private _kindeClient: typeof kindeClient;
  private _kindeClientInitialized: boolean = false;

  constructor(event: H3Event, kinde: typeof kindeClient = kindeClient) {
    this._event = event;
    this._session = this._event.context.session;
    this._kindeClient = kinde;
    this._kindeWebhookJwksClient = jwksClient({
      jwksUri: `${process.env.KINDE_AUTH_DOMAIN}/.well-known/jwks.json`,
    });
  }

  private async prepare() {
    try {
      if (this._kindeClientInitialized) return this._kindeClient;

      await this._kindeClient;
      this._kindeClientInitialized = true;
      return this._kindeClient;
    } catch (error) {
      throw new NetworkError("Unable to initialize kinde client", 500, {
        session: this._session,
        isKindeInitialized: this._kindeClientInitialized,
        rawError: error,
      });
    }
  }

  public async isAuthenticated() {
    try {
      return (await this.prepare()).isAuthenticated(this._session);
    } catch (error) {
      throw new ApplicationError("Unable to check authentication", 500, true, {
        session: this._session,
        isKindeInitialized: this._kindeClientInitialized,
        rawError: error,
      });
    }
  }

  public async getUserProfile() {
    try {
      return (await this.prepare()).getUserProfile(this._session);
    } catch (error) {
      throw new ApplicationError(
        "An error occured while retrieving the user profile",
        500,
        true,
        {
          session: this._session,
          isKindeInitialized: this._kindeClientInitialized,
          rawError: error,
        }
      );
    }
  }

  public async getAllPermissions() {
    try {
      const prepared = await this.prepare();
      const isAuthenticated = await prepared.isAuthenticated(this._session);

      if (!isAuthenticated) return null;

      return prepared.getPermissions(this._event.context.session);
    } catch (error) {
      throw new ApplicationError(
        "An error occured while retrieving permissions",
        500,
        false,
        {
          session: this._session,
          isKindeInitialized: this._kindeClientInitialized,
          rawError: error,
        }
      );
    }
  }

  public getWebhookContentType() {
    this._kindeWebhookContentType = getRequestHeader(
      this._event,
      "content-type"
    );
    if (this._kindeWebhookContentType !== "application/jwt")
      throw new KindeWebhookError(
        { webhooktype: undefined },
        this._kindeWebhookContentType
      );
    return this._kindeWebhookContentType;
  }

  private async getToken() {
    this._kindeWebhookToken = await readRawBody(this._event, "utf-8");

    if (Buffer.isBuffer(this._kindeWebhookToken))
      this._kindeWebhookToken.toString();
    else if (typeof this._kindeWebhookToken === "string")
      this._kindeWebhookToken;
    else
      throw new KindeWebhookError(
        {
          webhooktype: undefined,
          token: z.coerce.string().parse(this._kindeWebhookToken),
        },
        this.getWebhookContentType()
      );

    return this._kindeWebhookToken;
  }

  private getDecodedToken() {
    if (!this._kindeWebhookToken)
      throw new KindeWebhookError(
        {
          webhooktype: undefined,
          token: z.coerce.string().parse(this._kindeWebhookToken),
        },
        this.getWebhookContentType()
      );

    this._kindeWebhookTokenDecoded = jwt.decode(this._kindeWebhookToken, {
      complete: true,
    });

    if (!this._kindeWebhookTokenDecoded)
      throw new KindeWebhookError(
        {
          webhooktype: undefined,
          token: z.coerce.string().parse(this._kindeWebhookTokenDecoded),
        },
        this.getWebhookContentType()
      );

    return this._kindeWebhookTokenDecoded;
  }

  private async getSigningKey() {
    try {
      const { kid } = this.getDecodedToken().header;
      this._kindeWebhookSigningKey =
        await this._kindeWebhookJwksClient.getSigningKey(kid);
      return this._kindeWebhookSigningKey.getPublicKey();
    } catch (error) {
      throw new ApplicationError(
        "An error occured while retrieving the signing key",
        500,
        true,
        {
          session: this._session,
          isKindeInitialized: this._kindeClientInitialized,
          decodedToken: z.coerce.string().parse(this._kindeWebhookTokenDecoded),
          rawError: error,
        }
      );
    }
  }

  public async getWebhookPayload() {
    try {
      this._kindeWebhookPayload = jwt.verify(
        await this.getToken(),
        await this.getSigningKey()
      );

      if (typeof this._kindeWebhookPayload === "string")
        throw new KindeWebhookError(
          {
            webhooktype: undefined,
            token: z.coerce.string().parse(this._kindeWebhookToken),
          },
          this.getWebhookContentType(),
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
          session: this._session,
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
        { webhooktype: undefined, token: this._kindeWebhookToken },
        this.getWebhookContentType(),
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
          session: this._session,
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
