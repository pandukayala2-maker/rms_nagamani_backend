import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email().optional(),
  phone: z.string().min(6).max(20),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  membershipLevel: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
});

export const adjustLoyaltySchema = z.object({
  points: z.coerce.number().int(),
  reason: z.string().max(200).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
