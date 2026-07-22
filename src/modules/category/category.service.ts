import { categoryRepository } from "./category.repository";
import { ApiError } from "../../utils/ApiError";

export const categoryService = {
  list(branchId: string) {
    return categoryRepository.findMany(branchId);
  },

  async create(branchId: string, input: Record<string, unknown>) {
    return categoryRepository.create({ ...input, branchId } as never);
  },

  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await categoryRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Category not found");
    return categoryRepository.update(id, input as never);
  },

  async remove(id: string, branchId: string) {
    const existing = await categoryRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Category not found");
    const menuItemCount = await categoryRepository.countMenuItems(id);
    if (menuItemCount > 0) {
      throw ApiError.conflict(
        `This category still has ${menuItemCount} menu item${menuItemCount === 1 ? "" : "s"}. Reassign or delete them first.`
      );
    }
    await categoryRepository.remove(id);
  },
};
