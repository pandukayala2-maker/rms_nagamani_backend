import type { Request, Response } from "express";
import { tablesService } from "./tables.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const tablesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await tablesService.list(req.user!.branchId!));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const table = await tablesService.create(req.user!.branchId!, req.body);
    sendSuccess(res, table, "Table created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const table = await tablesService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, table, "Table updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await tablesService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Table deleted");
  }),

  merge: asyncHandler(async (req: Request, res: Response) => {
    const table = await tablesService.merge(
      req.user!.branchId!,
      req.body.sourceTableId,
      req.body.targetTableId
    );
    sendSuccess(res, table, "Tables merged");
  }),

  split: asyncHandler(async (req: Request, res: Response) => {
    const table = await tablesService.split(req.user!.branchId!, req.params.id);
    sendSuccess(res, table, "Table split");
  }),
};
