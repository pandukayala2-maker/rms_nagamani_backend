import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const createExpenseSchema = z.object({
  category: z.string().min(1).max(100),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
