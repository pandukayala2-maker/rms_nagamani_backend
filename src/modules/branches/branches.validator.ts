import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(1).max(150),
  address: z.string().max(300).optional(),
  contact: z.string().max(50).optional(),
  gstVat: z.string().max(50).optional(),
  currency: z.string().max(10).default("INR"),
  language: z.string().max(10).default("en"),
});

export const updateBranchSchema = createBranchSchema.partial().extend({
  isActive: z.coerce.boolean().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
