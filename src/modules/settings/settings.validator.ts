import { z } from "zod";

export const updateSettingsSchema = z.object({
  restaurantName: z.string().min(1).max(150).optional(),
  logo: z.string().optional(),
  address: z.string().max(300).optional(),
  contact: z.string().max(50).optional(),
  gstVat: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
  language: z.string().max(10).optional(),
  theme: z.enum(["light", "dark"]).optional(),
  notifyLowStock: z.coerce.boolean().optional(),
  notifyNewOrders: z.coerce.boolean().optional(),
  notifyCompletedOrders: z.coerce.boolean().optional(),
  notifyInventoryAlerts: z.coerce.boolean().optional(),
  notifyPaymentAlerts: z.coerce.boolean().optional(),
});
