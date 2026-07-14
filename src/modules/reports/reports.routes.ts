import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { reportsService } from "./reports.service";
import { dashboardService } from "../dashboard/dashboard.service";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      await reportsService.salesReport(req.user!.branchId!, req.query.from as string, req.query.to as string)
    );
  })
);

router.get(
  "/product",
  asyncHandler(async (req, res) => {
    sendSuccess(res, await dashboardService.topSellingItems(req.user!.branchId!, 20));
  })
);

router.get(
  "/category",
  asyncHandler(async (req, res) => {
    sendSuccess(res, await dashboardService.categorySales(req.user!.branchId!));
  })
);

router.get(
  "/tax",
  asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      await reportsService.taxReport(req.user!.branchId!, req.query.from as string, req.query.to as string)
    );
  })
);

router.get(
  "/cashier",
  asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      await reportsService.cashierReport(req.user!.branchId!, req.query.from as string, req.query.to as string)
    );
  })
);

router.get(
  "/profit-loss",
  asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      await reportsService.profitLoss(req.user!.branchId!, req.query.from as string, req.query.to as string)
    );
  })
);

export default router;
