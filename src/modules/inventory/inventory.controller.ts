import type { Request, Response } from "express";
import { inventoryService } from "./inventory.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const inventoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await inventoryService.list(req.user!.branchId!));
  }),

  lowStock: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await inventoryService.lowStock(req.user!.branchId!));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const item = await inventoryService.create(req.user!.branchId!, req.body);
    sendSuccess(res, item, "Inventory item created", 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const item = await inventoryService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, item, "Inventory item updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await inventoryService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Inventory item deleted");
  }),

  movements: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await inventoryService.movements(req.params.id, req.user!.branchId!));
  }),

  recordMovement: asyncHandler(async (req: Request, res: Response) => {
    const item = await inventoryService.recordMovement(
      req.params.id,
      req.user!.branchId!,
      req.user!.id,
      req.body
    );
    sendSuccess(res, item, "Stock movement recorded");
  }),

  listSuppliers: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await inventoryService.listSuppliers(req.user!.branchId!));
  }),

  createSupplier: asyncHandler(async (req: Request, res: Response) => {
    const supplier = await inventoryService.createSupplier(req.user!.branchId!, req.body);
    sendSuccess(res, supplier, "Supplier created", 201);
  }),

  listPurchaseOrders: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await inventoryService.listPurchaseOrders(req.user!.branchId!));
  }),

  createPurchaseOrder: asyncHandler(async (req: Request, res: Response) => {
    const po = await inventoryService.createPurchaseOrder(req.user!.branchId!, req.body);
    sendSuccess(res, po, "Purchase order created", 201);
  }),

  receivePurchaseOrder: asyncHandler(async (req: Request, res: Response) => {
    const po = await inventoryService.receivePurchaseOrder(
      req.params.id,
      req.user!.branchId!,
      req.user!.id
    );
    sendSuccess(res, po, "Purchase order received and stock updated");
  }),

  setPurchaseOrderPaid: asyncHandler(async (req: Request, res: Response) => {
    const po = await inventoryService.setPurchaseOrderPaid(
      req.params.id,
      req.user!.branchId!,
      req.body.isPaid
    );
    sendSuccess(res, po, "Purchase order payment status updated");
  }),
};
