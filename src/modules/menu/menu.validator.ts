import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(1).max(150),
  itemCode: z.string().min(1).max(50),
  categoryId: z.string().uuid(),
  subcategory: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().min(0).max(100).default(0),
  image: z.string().optional(),
  prepTimeMins: z.coerce.number().int().min(0).optional(),
  ingredients: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isVeg: z.coerce.boolean().default(true),
  spicyLevel: z.enum(["NONE", "MILD", "MEDIUM", "HOT", "EXTRA_HOT"]).default("NONE"),
  isFeatured: z.coerce.boolean().default(false),
  isBestseller: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["ACTIVE", "HIDDEN", "OUT_OF_STOCK", "DISABLED"]).default("ACTIVE"),
  showOnQr: z.coerce.boolean().default(true),
  posOnly: z.coerce.boolean().default(false),
  isTempHidden: z.coerce.boolean().default(false),
  isSeasonal: z.coerce.boolean().default(false),
  isAvailable: z.coerce.boolean().default(true),
});

export const updateMenuItemSchema = menuItemSchema.partial();

export const menuQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "HIDDEN", "OUT_OF_STOCK", "DISABLED"]).optional(),
  isVeg: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sortBy: z
    .enum(["name", "price", "displayOrder", "createdAt"])
    .default("displayOrder"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
