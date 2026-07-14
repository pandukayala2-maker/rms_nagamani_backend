import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const dashboardController = {
  kpis: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.kpis(req.user!.branchId!));
  }),
  dailySales: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.dailySales(req.user!.branchId!));
  }),
  weeklySales: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.weeklySales(req.user!.branchId!));
  }),
  monthlySales: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.monthlySales(req.user!.branchId!));
  }),
  categorySales: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.categorySales(req.user!.branchId!));
  }),
  topSellingItems: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.topSellingItems(req.user!.branchId!));
  }),
  revenueTrends: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.revenueTrends(req.user!.branchId!));
  }),
};
