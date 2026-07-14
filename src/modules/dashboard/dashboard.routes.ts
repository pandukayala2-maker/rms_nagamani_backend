import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

/**
 * @openapi
 * /dashboard/kpis:
 *   get:
 *     summary: Get dashboard KPI cards
 *     tags: [Dashboard]
 */
router.get("/kpis", dashboardController.kpis);
router.get("/sales/daily", dashboardController.dailySales);
router.get("/sales/weekly", dashboardController.weeklySales);
router.get("/sales/monthly", dashboardController.monthlySales);
router.get("/sales/by-category", dashboardController.categorySales);
router.get("/top-selling", dashboardController.topSellingItems);
router.get("/revenue-trends", dashboardController.revenueTrends);

export default router;
