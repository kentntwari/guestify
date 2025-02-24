import {
  WebhookEventType,
  UserCreatedWebhookEvent,
  UserDeletedWebhookEvent,
} from "@/types/kinde/webhooks";

import { z } from "zod";
import { H3Error } from "h3";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { KindeWebhookError } from "@/entities/errors/webhooks";
import { UserService } from "@/services/user";

const client = jwksClient({
  jwksUri: `${process.env.KINDE_AUTH_DOMAIN}/.well-known/jwks.json`,
});

export default defineEventHandler(async (event) => {
  try {
    assertMethod(event, "POST");
    if (handleCors(event, { origin: "*" })) return;

    const contentType = getRequestHeader(event, "content-type");

    if (contentType !== "application/jwt")
      throw new KindeWebhookError({ webhooktype: undefined }, contentType);

    let parsedToken: string;
    const token = await readRawBody(event, "utf-8");
    if (Buffer.isBuffer(token)) parsedToken = token.toString();
    else if (typeof token === "string") parsedToken = token;
    else
      throw new KindeWebhookError(
        { webhooktype: undefined, token: z.coerce.string().parse(token) },
        contentType
      );

    // TODO: use kinde decode library(@kinde/webhooks) instead
    const decoded = jwt.decode(parsedToken, { complete: true });

    if (!decoded)
      throw new KindeWebhookError(
        { webhooktype: undefined, token: z.coerce.string().parse(token) },
        contentType
      );

    const { kid } = decoded.header;
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();

    const w = await jwt.verify(token, signingKey);

    if (typeof w === "string")
      throw new KindeWebhookError({ webhooktype: undefined }, contentType);

    switch (w?.type) {
      case WebhookEventType.userCreated:
        const { data: userCreatedPayload } = w as UserCreatedWebhookEvent;
        new UserService().createUser({
          email: userCreatedPayload.user.email,
          id: userCreatedPayload.user.id,
          firstName: userCreatedPayload.user.first_name,
          lastName: userCreatedPayload.user.last_name,
        });
        break;

      case WebhookEventType.userDeleted:
        const { data: userDeletedPayload } = w as UserDeletedWebhookEvent;
        new UserService().deleteUser(userDeletedPayload.user.id);
        break;

      default:
        throw new KindeWebhookError(
          { webhooktype: z.coerce.string().parse(w?.type) },
          contentType
        );
    }

    return sendNoContent(event, 200);
  } catch (error) {
    //TODO: log error
    //FIX: Better error handling
    return { success: false, isError: true };
  }
});
