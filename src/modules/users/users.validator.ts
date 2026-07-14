import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
  phone: z.string().max(20).optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]).optional(),
  phone: z.string().max(20).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
