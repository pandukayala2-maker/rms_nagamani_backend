import type { Request, Response } from "express";
import { departmentService, designationService, shiftService } from "./hr.service";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const departmentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await departmentService.list(req.user!.branchId!));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.create(req.user!.branchId!, req.body);
    sendSuccess(res, department, "Department created", 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, department, "Department updated");
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await departmentService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Department deleted");
  }),
};

export const designationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await designationService.list(req.user!.branchId!));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const designation = await designationService.create(req.user!.branchId!, req.body);
    sendSuccess(res, designation, "Designation created", 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const designation = await designationService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, designation, "Designation updated");
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await designationService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Designation deleted");
  }),
};

export const shiftController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await shiftService.list(req.user!.branchId!));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const shift = await shiftService.create(req.user!.branchId!, req.body);
    sendSuccess(res, shift, "Shift created", 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const shift = await shiftService.update(req.params.id, req.user!.branchId!, req.body);
    sendSuccess(res, shift, "Shift updated");
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await shiftService.remove(req.params.id, req.user!.branchId!);
    sendSuccess(res, null, "Shift deleted");
  }),
};
