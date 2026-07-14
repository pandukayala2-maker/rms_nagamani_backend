import { z } from "zod";

export const createTableSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  capacity: z.coerce.number().int().min(1).default(2),
});

export const updateTableSchema = createTableSchema.partial().extend({
  status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).optional(),
});

export const mergeTablesSchema = z.object({
  sourceTableId: z.string().uuid(),
  targetTableId: z.string().uuid(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
