import type { Request, Response } from "express";
import { posSessionsService } from "./pos-sessions.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const posSessionsController = {
  open: asyncHandler(async (req: Request, res: Response) => {
    const session = await posSessionsService.open(req.user!.branchId!, req.user!.id, req.body.openingCash);
    sendSuccess(res, session, "Counter opened", 201);
  }),

  close: asyncHandler(async (req: Request, res: Response) => {
    const session = await posSessionsService.close(
      req.params.id,
      req.user!.branchId!,
      req.body.closingCash,
      req.body.notes
    );
    sendSuccess(res, session, "Counter closed");
  }),

  current: asyncHandler(async (req: Request, res: Response) => {
    const session = await posSessionsService.current(req.user!.branchId!, req.user!.id);
    sendSuccess(res, session);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await posSessionsService.list(req.user!.branchId!));
  }),

  report: asyncHandler(async (req: Request, res: Response) => {
    const report = await posSessionsService.report(req.params.id, req.user!.branchId!);
    sendSuccess(res, report);
  }),
};
