import { z } from "zod";

export type TUnkeyCreateKeyRequestOptions = z.infer<
  typeof UnkeyCreateKeyRequestOptionsSchema
>;

export const UnkeyCreateKeyRequestOptionsSchema = z.object({
  name: z.string().min(1).startsWith("guestify_"),
  apiId: z.string().includes("api"),
  externalId: z.string().min(1),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  meta: z.object({}).optional(),
  byteLength: z.number().min(16).optional(),
});

export const UnkeyCreateKeyResponseSchema = z.object({
  key: z.string().min(1),
  keyId: z.string().min(1).includes("key"),
});

export const UnkeyErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    docs: z.string().url(),
    message: z.string(),
    requestId: z.string(),
  }),
});
