import type { Request, Response } from "express";
import { expensesService } from "./expenses.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const expensesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const expenses = await expensesService.list(
      req.user!.branchId!,
      req.query.from as string,
      req.query.to as string
    );
    sendSuccess(res, expenses);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const expense = await expensesService.create(req.user!.branchId!, req.body);
    sendSuccess(res, expense, "Expense recorded", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const expense = await expensesService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, expense, "Expense updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await expensesService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Expense deleted");
  }),
};
