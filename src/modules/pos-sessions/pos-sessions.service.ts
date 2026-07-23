import { posSessionsRepository } from "./pos-sessions.repository";
import { ApiError } from "../../utils/ApiError";

export const posSessionsService = {
  async open(branchId: string, userId: string, openingCash: number) {
    const existing = await posSessionsRepository.findOpenForUser(branchId, userId);
    if (existing) throw ApiError.conflict("You already have an open counter session");
    return posSessionsRepository.create({ branchId, userId, openingCash });
  },

  async close(id: string, branchId: string, closingCash: number, notes?: string) {
    const session = await posSessionsRepository.findById(id, branchId);
    if (!session) throw ApiError.notFound("Session not found");
    if (session.status === "CLOSED") throw ApiError.conflict("This session is already closed");

    const cashPayments = await posSessionsRepository.sumCashPayments(id);
    const expectedCash = Number(session.openingCash) + Number(cashPayments._sum.amount ?? 0);

    const updated = await posSessionsRepository.update(id, {
      status: "CLOSED",
      closedAt: new Date(),
      closingCash,
      expectedCash,
      notes,
    });

    return { ...updated, variance: closingCash - expectedCash };
  },

  current(branchId: string, userId: string) {
    return posSessionsRepository.findOpenForUser(branchId, userId);
  },

  list(branchId: string) {
    return posSessionsRepository.findMany(branchId);
  },

  async report(id: string, branchId: string) {
    const session = await posSessionsRepository.findById(id, branchId);
    if (!session) throw ApiError.notFound("Session not found");

    const [orderStats, byMethod] = await Promise.all([
      posSessionsRepository.sessionOrderStats(id),
      posSessionsRepository.paymentsByMethod(id),
    ]);

    return {
      session,
      orderCount: orderStats._count,
      totalSales: Number(orderStats._sum.total ?? 0),
      paymentsByMethod: byMethod.map((row) => ({
        method: row.method,
        total: Number(row._sum.amount ?? 0),
        count: row._count,
      })),
    };
  },
};
