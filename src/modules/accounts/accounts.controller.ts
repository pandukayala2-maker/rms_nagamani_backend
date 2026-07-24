import type { Request, Response } from "express";
import { accountsService } from "./accounts.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const accountsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await accountsService.list(req.user!.branchId!));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const account = await accountsService.create(req.user!.branchId!, req.body);
    sendSuccess(res, account, "Account created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const account = await accountsService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, account, "Account updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await accountsService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Account deleted");
  }),
};
