import { WebhookEventType } from "@/types/kinde/webhooks";
import type { TApiResponse } from "@/utils/zschemas";

import { z } from "zod";

import { KindeWebhookError } from "@/entities/errors/webhooks";
import { UserService } from "@/services/user";
import { KindeWebhookService } from "@/services/webhook.kinde";
import { ApiError } from "@/entities/errors/api";
import { NetworkError } from "@/entities/errors/network";
import { ApplicationError } from "@/entities/errors/application";

export default defineEventHandler(async (event) => {
  try {
    assertMethod(event, "POST");

    if (handleCors(event, { origin: "*" })) return;

    const userService = new UserService();

    const kindeWebhookService = new KindeWebhookService(event);
    const webhookType = await kindeWebhookService.getWebhookType();
    const webhookPayload = await kindeWebhookService.getWebhookPayload();

    const { data: payload } = webhookPayload;

    switch (webhookType) {
      case WebhookEventType.userCreated:
        userService.create({
          email: payload.user.email,
          id: payload.user.id,
          firstName: payload.user.first_name,
          lastName: payload.user.last_name,
        });
        break;

      case WebhookEventType.userDeleted:
        userService.delete(payload.user.id);
        break;

      default:
        throw new KindeWebhookError(
          { webhooktype: z.coerce.string().parse(webhookType) },
          getRequestHeader(event, "content-type")
        );
    }

    return sendNoContent(event, 200);
  } catch (error) {
    if (error instanceof NetworkError)
      return {
        error: true,
        errorType: "NetworkError",
      } satisfies TApiResponse;

    if (error instanceof KindeWebhookError)
      return {
        error: true,
        errorType: "KindeWebhookError",
      } satisfies TApiResponse;

    if (error instanceof ApplicationError)
      return {
        error: true,
        errorType: "ApplicationError",
      } satisfies TApiResponse;

    throw new ApiError("WEBHOOK", error);
  }
});
