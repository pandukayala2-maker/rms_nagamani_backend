import type { Request, Response } from "express";
import { categoryService } from "./category.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const categoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.list(req.user!.branchId!);
    sendSuccess(res, categories);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.user!.branchId!, req.body);
    sendSuccess(res, category, "Category created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(
      req.params.id,
      req.user!.branchId!,
      req.body
    );
    sendSuccess(res, category, "Category updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Category deleted");
  }),
};
