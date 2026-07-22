import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
});
export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createDesignationSchema = z.object({
  name: z.string().min(1).max(100),
  departmentId: z.string().uuid().optional(),
});
export const updateDesignationSchema = createDesignationSchema.partial();

export const createShiftSchema = z.object({
  name: z.string().min(1).max(100),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format"),
});
export const updateShiftSchema = createShiftSchema.partial();
