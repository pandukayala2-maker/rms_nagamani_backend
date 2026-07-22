import type { Request, Response } from "express";
import path from "path";
import { qrService } from "./qr.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const qrController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const qr = await qrService.getOrCreate(req.user!.branchId!);
    sendSuccess(res, qr);
  }),

  regenerate: asyncHandler(async (req: Request, res: Response) => {
    const qr = await qrService.regenerate(req.user!.branchId!);
    sendSuccess(res, qr, "QR code regenerated");
  }),

  toggle: asyncHandler(async (req: Request, res: Response) => {
    const qr = await qrService.toggle(req.user!.branchId!, req.body.isActive);
    sendSuccess(res, qr, "QR code status updated");
  }),

  download: asyncHandler(async (req: Request, res: Response) => {
    const imagePath = await qrService.getDownloadPath(req.user!.branchId!);
    res.download(path.join(process.cwd(), imagePath!.replace(/^\//, "")));
  }),

  publicMenu: asyncHandler(async (req: Request, res: Response) => {
    const menu = await qrService.getPublicMenu(req.params.token);
    sendSuccess(res, menu, "Menu fetched");
  }),

  placePublicOrder: asyncHandler(async (req: Request, res: Response) => {
    const result = await qrService.placeOrder(req.params.token, req.body);
    sendSuccess(res, result, "Order placed", 201);
  }),
};
