import { z } from "zod";

export const createQrSchema = z.object({
  type: z.enum(["BRANCH", "TABLE"]),
  tableId: z.string().uuid().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const tokenParamSchema = z.object({
  token: z.string().min(10),
});

export const publicOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(50),
        notes: z.string().max(300).optional(),
      })
    )
    .min(1)
    .max(50),
  customerName: z.string().max(100).optional(),
  customerPhone: z.string().max(20).optional(),
});
