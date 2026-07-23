import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const expensesRepository = {
  findMany(branchId: string, from?: Date, to?: Date) {
    return prisma.expense.findMany({
      where: {
        branchId,
        ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      },
      orderBy: { date: "desc" },
    });
  },

  findById(id: string, branchId: string) {
    return prisma.expense.findFirst({ where: { id, branchId } });
  },

  create(data: Prisma.ExpenseUncheckedCreateInput) {
    return prisma.expense.create({ data });
  },

  update(id: string, data: Prisma.ExpenseUncheckedUpdateInput) {
    return prisma.expense.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.expense.delete({ where: { id } });
  },
};
