import type { Request, Response } from "express";
import { branchesService } from "./branches.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const branchesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await branchesService.list());
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await branchesService.create(req.body), "Branch created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await branchesService.update(req.params.id, req.body), "Branch updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await branchesService.remove(req.params.id);
    sendSuccess(res, null, "Branch deleted");
  }),
};
