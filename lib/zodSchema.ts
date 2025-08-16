import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(9, "email number is too short"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type LoginType = z.infer<typeof loginSchema>;
