import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const openSessionSchema = z.object({
  openingCash: z.coerce.number().min(0),
});

export const closeSessionSchema = z.object({
  closingCash: z.coerce.number().min(0),
  notes: z.string().max(500).optional(),
});
