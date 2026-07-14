import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const tablesRepository = {
  findMany(branchId: string) {
    return prisma.restaurantTable.findMany({
      where: { branchId },
      include: { qrCode: { select: { id: true, token: true, isActive: true } } },
      orderBy: { code: "asc" },
    });
  },

  findById(id: string, branchId: string) {
    return prisma.restaurantTable.findFirst({ where: { id, branchId } });
  },

  create(data: Prisma.RestaurantTableUncheckedCreateInput) {
    return prisma.restaurantTable.create({ data });
  },

  update(id: string, data: Prisma.RestaurantTableUncheckedUpdateInput) {
    return prisma.restaurantTable.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.restaurantTable.delete({ where: { id } });
  },
};
