import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const createAccountSchema = z.object({
  name: z.string().min(1).max(150),
  code: z.string().max(30).optional(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  parentId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();
