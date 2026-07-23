import { expensesRepository } from "./expenses.repository";
import { ApiError } from "../../utils/ApiError";

export const expensesService = {
  list(branchId: string, from?: string, to?: string) {
    return expensesRepository.findMany(branchId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  },

  create(branchId: string, input: Record<string, unknown>) {
    return expensesRepository.create({ ...input, branchId } as never);
  },

  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await expensesRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Expense not found");
    return expensesRepository.update(id, input as never);
  },

  async remove(id: string, branchId: string) {
    const existing = await expensesRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Expense not found");
    await expensesRepository.remove(id);
  },
};
