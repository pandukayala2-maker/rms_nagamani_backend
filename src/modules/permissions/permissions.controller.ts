import type { Request, Response } from "express";
import { permissionsService } from "./permissions.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const permissionsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await permissionsService.list());
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await permissionsService.update(req.params.role as never, req.body.allowedNavKeys);
    sendSuccess(res, updated, "Permissions updated");
  }),

  mine: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await permissionsService.getMine(req.user!.role));
  }),
};
