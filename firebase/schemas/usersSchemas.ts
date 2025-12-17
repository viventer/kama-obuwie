import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(64),
  lastName: z.string().min(1).max(64),
  createdAt: z.date().optional(),
  role: z.enum(["UNVERIFIED", "VERIFIED", "ADMIN"]).default("UNVERIFIED"),
  perms: z.record(z.string(), z.boolean()).default({}),
});

export type UserType = z.infer<typeof UserSchema>;
