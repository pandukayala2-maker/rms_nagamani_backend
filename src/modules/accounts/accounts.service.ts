import { accountsRepository } from "./accounts.repository";
import { ApiError } from "../../utils/ApiError";

export const accountsService = {
  list(branchId: string) {
    return accountsRepository.findMany(branchId);
  },

  create(branchId: string, input: Record<string, unknown>) {
    return accountsRepository.create({ ...input, branchId } as never);
  },

  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await accountsRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Account not found");
    return accountsRepository.update(id, input as never);
  },

  async remove(id: string, branchId: string) {
    const existing = await accountsRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Account not found");

    const childCount = await accountsRepository.countChildren(id);
    if (childCount > 0) {
      throw ApiError.conflict(
        `This account has ${childCount} sub-account${childCount === 1 ? "" : "s"}. Reassign or delete them first.`
      );
    }
    const expenseCount = await accountsRepository.countExpenses(id);
    if (expenseCount > 0) {
      throw ApiError.conflict(
        `This account is used by ${expenseCount} expense${expenseCount === 1 ? "" : "s"}. Reassign them first.`
      );
    }
    await accountsRepository.remove(id);
  },
};
