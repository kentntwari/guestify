import { Base as BaseService } from "_services/_base";

import type { ClerkWebhookEntity } from "_entities/webhook.clerk";
import type { TNewClerkUserPrivateMetadata } from "utils/schemas.zod";

import { NetworkError } from "errors/network";
import { ApplicationError } from "errors/application";

import {
  UnkeySecretService,
  UnkeySecretServiceError,
} from "_services/secrets.unkey";
import { UserService } from "_services/user";

import { WebhookClerkFactory } from "_factory/webhook.clerk";

import { WebhookClerkMapper } from "_mapper/webhook.clerk";

import { CacheHelper } from "helpers/cache";
import { keys } from "constants/keys";

export class WebhookClerkService extends BaseService {
  constructor(
    private unkeyService: UnkeySecretService = new UnkeySecretService(),
    private userService: UserService = new UserService(),
    private cache: CacheHelper = new CacheHelper()
  ) {
    super();
  }

  // TODO: Add comments and logs
  public async processWebhook(webhook: ClerkWebhookEntity) {
    try {
      switch (webhook.type) {
        case "user.created":
          const result = await this.createUserFromWebhook(webhook);
          if (result.status === "error")
            return WebhookClerkMapper.toResultError(result.error);
          return WebhookClerkMapper.toResultSuccess("created", result.data);
        case "user.updated":
          return WebhookClerkMapper.toResultError(
            new WebhookClerkServiceError(
              "User update webhook handling not yet implemented"
            )
          );
        case "user.deleted":
          return WebhookClerkMapper.toResultError(
            new WebhookClerkServiceError(
              "User delete webhook handling not yet implemented"
            )
          );
        default:
          return WebhookClerkMapper.toResultError(
            new WebhookClerkServiceError(
              "Expected valid user webhook event type but received " +
                webhook.type
            )
          );
      }
    } catch (error) {
      return WebhookClerkMapper.toResultError(this.mapError(error));
    }
  }

  private async createUserFromWebhook(webhook: ClerkWebhookEntity) {
    try {
      const incomingUser = WebhookClerkFactory.validateWebhookUserData(webhook);

      const unkey = await this.unkeyService.generate(incomingUser.id, {
        fullName: incomingUser.fullName,
        email: incomingUser.emailAddress,
      });

      if (!unkey.data) {
        return WebhookClerkMapper.toResultError(
          new WebhookClerkServiceError(
            "Failed to generate API key",
            unkey.error
          )
        );
      }

      // await this.saveUserApiKey(
      //   unkey.data.key,
      //   incomingUser.id,
      //   incomingUser.emailAddress
      // );

      const createdUser = await this.userService.createUser(
        incomingUser,
        unkey.data.key
      );

      if (createdUser.status === "error") throw createdUser.error;
      return WebhookClerkMapper.toResultSuccess("created", createdUser.data);
    } catch (error) {
      return WebhookClerkMapper.toResultError(this.mapError(error));
    }
  }

  private async saveUserApiKey(
    apiKey: string,
    userId: string,
    userEmail: string
  ) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      const results = await Promise.allSettled([
        this.cache
          .update(keys.USER_API_KEY(userEmail), 86400)
          .userApiKey(apiKey, "free"),
        WebhookClerkFactory.exposeClerkApiClient().update.metadata({
          id: userId,
          private_metadata: {
            key: apiKey,
            plan: "free",
          } satisfies TNewClerkUserPrivateMetadata,
          public_metadata: {},
          unsafe_metadata: {},
        }),
      ]);

      const [redisResult, clerkResult] = results;

      if (
        redisResult.status === "fulfilled" &&
        clerkResult.status === "fulfilled"
      ) {
        return;
      }

      attempt++;
      if (attempt < maxRetries) {
        continue;
      }

      // On last attempt, throw appropriate error
      if (
        redisResult.status === "rejected" &&
        clerkResult.status === "rejected"
      ) {
        throw new NetworkError(
          "Failed to update both Redis and Clerk user metadata",
          { redis: redisResult.reason, clerk: clerkResult.reason },
          "saveUserApiKey.services/webhook.clerk"
        );
      }
      if (redisResult.status === "rejected") {
        throw new NetworkError(
          "Failed to update Redis user API key",
          { error: redisResult.reason },
          "saveUserApiKey.services/webhook.clerk"
        );
      }
      if (clerkResult.status === "rejected") {
        throw new NetworkError(
          "Failed to update Clerk user metadata",
          { error: clerkResult.reason },
          "saveUserApiKey.services/webhook.clerk"
        );
      }
    }
  }

  protected mapError(
    error: unknown
  ): ApplicationError | WebhookClerkServiceError | NetworkError {
    console.log("Mapping error:", error);
    switch (true) {
      case error instanceof WebhookClerkServiceError:
        return error;
      case error instanceof ApplicationError:
        return error;
      case error instanceof NetworkError:
        return error;
      case error instanceof UnkeySecretServiceError:
        return new ApplicationError(
          error.message,
          { error },
          "services.secrets.unkey"
        );
      default:
        return new ApplicationError(
          "Unexpected error occured",
          { error },
          "services.webhook.clerk"
        );
    }
  }
}

export class WebhookClerkServiceError extends ApplicationError {
  constructor(message: string, rawError: unknown = null) {
    super(message);
    this.name = "CLERK SERVICE ERROR";
    if (rawError) this.context = this._isDevMode ? rawError : {};
  }
}
