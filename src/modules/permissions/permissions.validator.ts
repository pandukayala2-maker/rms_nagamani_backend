import { z } from "zod";
import { NAV_KEYS } from "../../config/navKeys";

export const roleParamSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "CUSTOMER"]),
});

export const updatePermissionSchema = z.object({
  allowedNavKeys: z.array(z.enum(NAV_KEYS)),
});
