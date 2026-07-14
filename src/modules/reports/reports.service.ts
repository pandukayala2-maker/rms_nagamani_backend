import { prisma } from "../../config/prisma";

export const reportsService = {
  async salesReport(branchId: string, from?: string, to?: string) {
    const where = {
      branchId,
      status: "COMPLETED" as const,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };
    const orders = await prisma.order.findMany({ where });
    const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalTax = orders.reduce((sum, o) => sum + Number(o.tax), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0);
    return { orderCount: orders.length, totalSales, totalTax, totalDiscount };
  },

  async taxReport(branchId: string, from?: string, to?: string) {
    const summary = await this.salesReport(branchId, from, to);
    return { totalTaxCollected: summary.totalTax, orderCount: summary.orderCount };
  },

  async cashierReport(branchId: string, from?: string, to?: string) {
    const where = {
      branchId,
      status: "COMPLETED" as const,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };
    const orders = await prisma.order.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true } } },
    });
    const map = new Map<string, { cashier: string; orders: number; total: number }>();
    for (const order of orders) {
      const key = order.createdById ?? "unknown";
      const entry = map.get(key) ?? { cashier: order.createdBy?.name ?? "Unknown", orders: 0, total: 0 };
      entry.orders += 1;
      entry.total += Number(order.total);
      map.set(key, entry);
    }
    return Array.from(map.values());
  },

  async profitLoss(branchId: string, from?: string, to?: string) {
    const summary = await this.salesReport(branchId, from, to);
    const estimatedCost = summary.totalSales * 0.68;
    return {
      revenue: summary.totalSales,
      estimatedCost,
      profit: summary.totalSales - estimatedCost,
    };
  },
};
