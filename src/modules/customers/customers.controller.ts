import type { Request, Response } from "express";
import { customersService } from "./customers.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const customersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await customersService.list(req.query.search as string | undefined));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await customersService.create(req.body), "Customer created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await customersService.update(req.params.id, req.body), "Customer updated");
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await customersService.history(req.params.id));
  }),

  adjustLoyalty: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.adjustLoyalty(req.params.id, req.body.points);
    sendSuccess(res, customer, "Loyalty points updated");
  }),
};
