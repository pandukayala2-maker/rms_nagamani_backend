import type { Request, Response } from "express";
import { ordersService } from "./orders.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { streamReceiptPdf } from "../../utils/pdf";

export const ordersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await ordersService.list(req.user!.branchId!, req.query as never);
    sendSuccess(res, result.items, "Orders fetched", 200, { pagination: result.pagination });
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await ordersService.getById(req.params.id, req.user!.branchId!));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.create(req.user!.branchId!, req.user!.id, req.body);
    sendSuccess(res, order, "Order created", 201);
  }),

  updateItems: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.updateItems(req.params.id, req.user!.branchId!, req.body.items);
    sendSuccess(res, order, "Order items updated");
  }),

  hold: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await ordersService.hold(req.params.id, req.user!.branchId!), "Bill held");
  }),

  resume: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await ordersService.resume(req.params.id, req.user!.branchId!), "Bill resumed");
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.updateStatus(req.params.id, req.user!.branchId!, req.body.status);
    sendSuccess(res, order, "Order status updated");
  }),

  addPayments: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.addPayments(
      req.params.id,
      req.user!.branchId!,
      req.body.payments
    );
    sendSuccess(res, order, "Payment recorded");
  }),

  receipt: asyncHandler(async (req: Request, res: Response) => {
    const receipt = await ordersService.getReceiptData(req.params.id, req.user!.branchId!);
    streamReceiptPdf(res, receipt);
  }),
};
