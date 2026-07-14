import type { Request, Response } from "express";
import { settingsService } from "./settings.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const settingsController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await settingsService.get(req.user!.branchId!));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await settingsService.update(req.user!.branchId!, req.body), "Settings updated");
  }),
};
