import type { Request, Response } from "express";
import { menuService } from "./menu.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

export const menuController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await menuService.list(req.user!.branchId!, req.query as never);
    sendSuccess(res, result.items, "Menu items fetched", 200, { pagination: result.pagination });
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const item = await menuService.getById(req.params.id, req.user!.branchId!);
    sendSuccess(res, item);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const item = await menuService.create(req.user!.branchId!, req.body);
    sendSuccess(res, item, "Menu item created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const item = await menuService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, item, "Menu item updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await menuService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Menu item deleted");
  }),

  duplicate: asyncHandler(async (req: Request, res: Response) => {
    const item = await menuService.duplicate(req.params.id, req.user!.branchId!);
    sendSuccess(res, item, "Menu item duplicated", 201);
  }),

  bulkImport: asyncHandler(async (req: Request, res: Response) => {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest("Provide a non-empty 'items' array to import");
    }
    const result = await menuService.bulkImport(req.user!.branchId!, items);
    sendSuccess(res, result, "Menu items imported");
  }),

  bulkExport: asyncHandler(async (req: Request, res: Response) => {
    const csv = await menuService.bulkExportCsv(req.user!.branchId!);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="menu-export.csv"');
    res.send(csv);
  }),
};
