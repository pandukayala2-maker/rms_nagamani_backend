import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const categoryRepository = {
  findMany(branchId: string) {
    return prisma.category.findMany({
      where: { branchId },
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { menuItems: true } } },
    });
  },

  findById(id: string, branchId: string) {
    return prisma.category.findFirst({ where: { id, branchId } });
  },

  create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({ data });
  },

  update(id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
