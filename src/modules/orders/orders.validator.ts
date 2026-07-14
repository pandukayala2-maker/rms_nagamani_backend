import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
  notes: z.string().max(300).optional(),
});

export const createOrderSchema = z.object({
  orderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).default("DINE_IN"),
  tableId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1),
  couponCode: z.string().optional(),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional(),
  isHeld: z.coerce.boolean().default(false),
});

export const updateOrderItemsSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"]),
});

export const addPaymentSchema = z.object({
  payments: z
    .array(
      z.object({
        method: z.enum(["CASH", "CARD", "UPI", "WALLET", "MIXED"]),
        amount: z.coerce.number().positive(),
        transactionRef: z.string().optional(),
      })
    )
    .min(1),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"]).optional(),
  orderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).optional(),
  isHeld: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
