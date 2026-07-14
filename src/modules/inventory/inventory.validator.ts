import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name: z.string().min(1).max(150),
  unit: z.string().min(1).max(20).default("unit"),
  quantity: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  costPerUnit: z.coerce.number().min(0).default(0),
  expiryDate: z.string().datetime().optional(),
  supplierId: z.string().uuid().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const stockMovementSchema = z.object({
  type: z.enum(["STOCK_IN", "STOCK_OUT", "ADJUSTMENT", "WASTE"]),
  quantity: z.coerce.number().positive(),
  reason: z.string().max(300).optional(),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1).max(150),
  contact: z.string().max(50).optional(),
  email: z.string().email().optional(),
  address: z.string().max(300).optional(),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().uuid(),
        quantity: z.coerce.number().positive(),
        unitCost: z.coerce.number().min(0),
      })
    )
    .min(1),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
