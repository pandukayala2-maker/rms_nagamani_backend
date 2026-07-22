import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
  phone: z.string().max(20).optional(),
  employeeCode: z.string().max(50).optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]).optional(),
  phone: z.string().max(20).optional(),
  isActive: z.coerce.boolean().optional(),
  employeeCode: z.string().max(50).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  designationId: z.string().uuid().nullable().optional(),
  shiftId: z.string().uuid().nullable().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
