import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import categoryRoutes from "../modules/category/category.routes";
import menuRoutes from "../modules/menu/menu.routes";
import qrRoutes from "../modules/qr/qr.routes";
import tablesRoutes from "../modules/tables/tables.routes";
import ordersRoutes from "../modules/orders/orders.routes";
import inventoryRoutes from "../modules/inventory/inventory.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import usersRoutes from "../modules/users/users.routes";
import branchesRoutes from "../modules/branches/branches.routes";
import customersRoutes from "../modules/customers/customers.routes";
import settingsRoutes from "../modules/settings/settings.routes";
import reportsRoutes from "../modules/reports/reports.routes";
import { qrController } from "../modules/qr/qr.controller";
import { validate } from "../middleware/validate";
import { tokenParamSchema } from "../modules/qr/qr.validator";

const router = Router();

// Public, unauthenticated customer-facing QR menu endpoint.
router.get("/public/menu/:token", validate({ params: tokenParamSchema }), qrController.publicMenu);

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/menu-items", menuRoutes);
router.use("/qr-codes", qrRoutes);
router.use("/tables", tablesRoutes);
router.use("/orders", ordersRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/staff", usersRoutes);
router.use("/branches", branchesRoutes);
router.use("/customers", customersRoutes);
router.use("/settings", settingsRoutes);
router.use("/reports", reportsRoutes);

export default router;
