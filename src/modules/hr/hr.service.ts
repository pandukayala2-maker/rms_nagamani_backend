import { departmentRepository, designationRepository, shiftRepository } from "./hr.repository";
import { ApiError } from "../../utils/ApiError";

function inUseError(entity: string, count: number) {
  return ApiError.conflict(
    `This ${entity} is assigned to ${count} employee${count === 1 ? "" : "s"}. Reassign them first.`
  );
}

export const departmentService = {
  list(branchId: string) {
    return departmentRepository.findMany(branchId);
  },
  create(branchId: string, input: Record<string, unknown>) {
    return departmentRepository.create({ ...input, branchId } as never);
  },
  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await departmentRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Department not found");
    return departmentRepository.update(id, input as never);
  },
  async remove(id: string, branchId: string) {
    const existing = await departmentRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Department not found");
    const count = await departmentRepository.countUsers(id);
    if (count > 0) throw inUseError("department", count);
    await departmentRepository.remove(id);
  },
};

export const designationService = {
  list(branchId: string) {
    return designationRepository.findMany(branchId);
  },
  create(branchId: string, input: Record<string, unknown>) {
    return designationRepository.create({ ...input, branchId } as never);
  },
  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await designationRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Designation not found");
    return designationRepository.update(id, input as never);
  },
  async remove(id: string, branchId: string) {
    const existing = await designationRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Designation not found");
    const count = await designationRepository.countUsers(id);
    if (count > 0) throw inUseError("designation", count);
    await designationRepository.remove(id);
  },
};

export const shiftService = {
  list(branchId: string) {
    return shiftRepository.findMany(branchId);
  },
  create(branchId: string, input: Record<string, unknown>) {
    return shiftRepository.create({ ...input, branchId } as never);
  },
  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await shiftRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Shift not found");
    return shiftRepository.update(id, input as never);
  },
  async remove(id: string, branchId: string) {
    const existing = await shiftRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Shift not found");
    const count = await shiftRepository.countUsers(id);
    if (count > 0) throw inUseError("shift", count);
    await shiftRepository.remove(id);
  },
};
