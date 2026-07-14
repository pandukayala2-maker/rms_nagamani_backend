import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

interface ListParams {
  branchId: string;
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  status?: string;
  isVeg?: boolean;
  sortBy: string;
  sortDir: "asc" | "desc";
}

export const menuRepository = {
  async findMany(params: ListParams) {
    const where: Prisma.MenuItemWhereInput = {
      branchId: params.branchId,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.isVeg !== undefined ? { isVeg: params.isVeg } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { itemCode: { contains: params.search, mode: "insensitive" } },
              { tags: { has: params.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { [params.sortBy]: params.sortDir },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.menuItem.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string, branchId: string) {
    return prisma.menuItem.findFirst({
      where: { id, branchId },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  create(data: Prisma.MenuItemUncheckedCreateInput) {
    return prisma.menuItem.create({ data });
  },

  update(id: string, data: Prisma.MenuItemUncheckedUpdateInput) {
    return prisma.menuItem.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.menuItem.delete({ where: { id } });
  },

  findManyByIds(ids: string[], branchId: string) {
    return prisma.menuItem.findMany({ where: { id: { in: ids }, branchId } });
  },

  createMany(data: Prisma.MenuItemCreateManyInput[]) {
    return prisma.menuItem.createMany({ data, skipDuplicates: true });
  },

  findAllForExport(branchId: string) {
    return prisma.menuItem.findMany({
      where: { branchId },
      include: { category: { select: { name: true } } },
      orderBy: { displayOrder: "asc" },
    });
  },
};
