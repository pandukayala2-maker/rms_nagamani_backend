import type { Request, Response } from "express";
import path from "path";
import { qrService } from "./qr.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const qrController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const codes = await qrService.list(req.user!.branchId!);
    sendSuccess(res, codes);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const qr = await qrService.create(req.user!.branchId!, req.body);
    sendSuccess(res, qr, "QR code generated", 201);
  }),

  regenerate: asyncHandler(async (req: Request, res: Response) => {
    const qr = await qrService.regenerate(req.params.id, req.user!.branchId!);
    sendSuccess(res, qr, "QR code regenerated");
  }),

  toggle: asyncHandler(async (req: Request, res: Response) => {
    const qr = await qrService.toggle(req.params.id, req.user!.branchId!, req.body.isActive);
    sendSuccess(res, qr, "QR code status updated");
  }),

  download: asyncHandler(async (req: Request, res: Response) => {
    const imagePath = await qrService.getDownloadPath(req.params.id, req.user!.branchId!);
    res.download(path.join(process.cwd(), imagePath!.replace(/^\//, "")));
  }),

  publicMenu: asyncHandler(async (req: Request, res: Response) => {
    const menu = await qrService.getPublicMenu(req.params.token);
    sendSuccess(res, menu, "Menu fetched");
  }),
};
