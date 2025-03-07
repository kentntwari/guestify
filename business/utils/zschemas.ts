import { z } from "zod";

export const apiResponseSchema = z.object({
  isAuthenticated: z.boolean().optional(),
  permissions: z.array(z.string()).nullable().optional(),
  error: z.boolean(),
  errorType: z
    .enum([
      "NetworkError",
      "ApplicationError",
      "ServiceError",
      "KindeWebhookError",
    ])
    .nullable(),
});

export type TApiResponse = z.infer<typeof apiResponseSchema>;
