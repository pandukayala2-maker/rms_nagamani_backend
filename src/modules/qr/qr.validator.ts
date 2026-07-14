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
