import type { Request, Response } from "express";
import { usersService } from "./users.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const usersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await usersService.list(req.user!.branchId!));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.create(req.user!.branchId!, req.body);
    sendSuccess(res, user, "Staff member created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, user, "Staff member updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await usersService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Staff member removed");
  }),
};
