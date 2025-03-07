import { TApiResponse } from "@/utils/zschemas";

import { KindeWebhookService } from "@/services/webhook";
import { ApiError } from "@/entities/errors/api";
import { NetworkError } from "@/entities/errors/network";
import { ApplicationError } from "@/entities/errors/application";

export default defineEventHandler(async (event) => {
  try {
    const isAuthenticated = await new KindeWebhookService(
      event
    ).isAuthenticated();

    return {
      isAuthenticated,
      error: false,
      errorType: null,
    } satisfies TApiResponse;
  } catch (error) {
    if (error instanceof NetworkError)
      return {
        error: true,
        errorType: "NetworkError",
      } satisfies TApiResponse;

    if (error instanceof ApplicationError)
      return {
        error: true,
        errorType: "ApplicationError",
      } satisfies TApiResponse;

    throw new ApiError("USER", error);
  }
});
