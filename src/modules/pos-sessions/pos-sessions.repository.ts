import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const posSessionsRepository = {
  findOpenForUser(branchId: string, userId: string) {
    return prisma.posSession.findFirst({
      where: { branchId, userId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
    });
  },

  findById(id: string, branchId: string) {
    return prisma.posSession.findFirst({
      where: { id, branchId },
      include: { user: { select: { id: true, name: true } } },
    });
  },

  findMany(branchId: string) {
    return prisma.posSession.findMany({
      where: { branchId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { openedAt: "desc" },
    });
  },

  create(data: Prisma.PosSessionUncheckedCreateInput) {
    return prisma.posSession.create({ data });
  },

  update(id: string, data: Prisma.PosSessionUncheckedUpdateInput) {
    return prisma.posSession.update({ where: { id }, data });
  },

  sumCashPayments(sessionId: string) {
    return prisma.payment.aggregate({
      where: { method: "CASH", order: { posSessionId: sessionId } },
      _sum: { amount: true },
    });
  },

  sessionOrderStats(sessionId: string) {
    return prisma.order.aggregate({
      where: { posSessionId: sessionId },
      _sum: { total: true },
      _count: true,
    });
  },

  paymentsByMethod(sessionId: string) {
    return prisma.payment.groupBy({
      by: ["method"],
      where: { order: { posSessionId: sessionId } },
      _sum: { amount: true },
      _count: true,
    });
  },
};
