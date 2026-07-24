import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const accountsRepository = {
  findMany(branchId: string) {
    return prisma.account.findMany({
      where: { branchId },
      include: { parent: { select: { id: true, name: true } } },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  },

  findById(id: string, branchId: string) {
    return prisma.account.findFirst({ where: { id, branchId } });
  },

  create(data: Prisma.AccountUncheckedCreateInput) {
    return prisma.account.create({ data });
  },

  update(id: string, data: Prisma.AccountUncheckedUpdateInput) {
    return prisma.account.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.account.delete({ where: { id } });
  },

  countChildren(id: string) {
    return prisma.account.count({ where: { parentId: id } });
  },

  countExpenses(id: string) {
    return prisma.expense.count({ where: { accountId: id } });
  },
};
