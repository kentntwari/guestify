import type { TApiResponse } from "@/utils/zschemas";

import { KindeWebhookService } from "@/services/webhook.kinde";
import { ApiError } from "@/entities/errors/api";
import { NetworkError } from "@/entities/errors/network";
import { ApplicationError } from "@/entities/errors/application";

export default defineEventHandler(async (event) => {
  try {
    const service = await new KindeWebhookService(event).getAllPermissions();
    return {
      permissions: service ? service.permissions : null,
      error: false,
      errorType: null,
    } satisfies TApiResponse;
  } catch (error) {
    if (error instanceof NetworkError)
      return {
        permissions: null,
        error: true,
        errorType: "NetworkError",
      } satisfies TApiResponse;

    if (error instanceof ApplicationError)
      return {
        permissions: null,
        error: true,
        errorType: "ApplicationError",
      } satisfies TApiResponse;

    throw new ApiError("PERMISSIONS", error);
  }
});
