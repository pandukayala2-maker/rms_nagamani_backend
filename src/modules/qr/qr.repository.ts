import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const qrRepository = {
  findMany(branchId: string) {
    return prisma.qRCode.findMany({
      where: { branchId },
      include: { table: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string, branchId: string) {
    return prisma.qRCode.findFirst({ where: { id, branchId } });
  },

  findByToken(token: string) {
    return prisma.qRCode.findUnique({ where: { token } });
  },

  create(data: Prisma.QRCodeUncheckedCreateInput) {
    return prisma.qRCode.create({ data });
  },

  update(id: string, data: Prisma.QRCodeUncheckedUpdateInput) {
    return prisma.qRCode.update({ where: { id }, data });
  },

  incrementScan(id: string) {
    return prisma.qRCode.update({ where: { id }, data: { scanCount: { increment: 1 } } });
  },
};
