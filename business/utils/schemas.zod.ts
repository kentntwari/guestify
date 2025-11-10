import { z } from "zod";

export type TUserSchema = z.infer<typeof userSchema>;
export type TUserCreateSchema = z.infer<typeof userCreateSchema>;
export type TVerifyUnkeyResponseSchema = z.infer<
  typeof verifyUnkeyResponseSchema
>;

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  imageUrl: z.string().url().nullable(),
});

export const userCreateSchema = userSchema;

export const verifyUnkeyResponseSchema = z.object({
  valid: z.boolean(),
  keyId: z.string(),
  permissions: z.array(z.string()),
  roles: z.array(z.string()),
});

export const verifyUnkeyApiClientResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.object({}).nullable(),
});
