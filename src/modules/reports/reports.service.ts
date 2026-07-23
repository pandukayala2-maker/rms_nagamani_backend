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

    const expenses = await prisma.expense.findMany({
      where: {
        branchId,
        ...(from || to
          ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } }
          : {}),
      },
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const expensesByCategory = Array.from(
      expenses
        .reduce((map, e) => {
          const current = map.get(e.category) ?? 0;
          map.set(e.category, current + Number(e.amount));
          return map;
        }, new Map<string, number>())
        .entries()
    ).map(([category, total]) => ({ category, total }));

    return {
      revenue: summary.totalSales,
      estimatedCost,
      totalExpenses,
      expensesByCategory,
      profit: summary.totalSales - estimatedCost - totalExpenses,
    };
  },

  // Simplified/derived balance sheet — there is no chart of accounts or
  // ledger in this system, so these figures are best-effort proxies, not a
  // GAAP-compliant statement.
  async balanceSheet(branchId: string) {
    const [inventoryItems, closedSessions, openSessions, liabilities] = await Promise.all([
      prisma.inventoryItem.findMany({ where: { branchId }, select: { quantity: true, costPerUnit: true } }),
      prisma.posSession.findMany({ where: { branchId, status: "CLOSED" }, select: { closingCash: true } }),
      prisma.posSession.findMany({ where: { branchId, status: "OPEN" }, select: { openingCash: true } }),
      prisma.purchaseOrder.findMany({
        where: { branchId, status: { in: ["ORDERED", "RECEIVED"] }, isPaid: false },
        select: { totalAmount: true },
      }),
    ]);

    const inventoryValue = inventoryItems.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.costPerUnit),
      0
    );
    const cashOnHand =
      closedSessions.reduce((sum, s) => sum + Number(s.closingCash ?? 0), 0) +
      openSessions.reduce((sum, s) => sum + Number(s.openingCash), 0);

    const totalAssets = inventoryValue + cashOnHand;
    const totalLiabilities = liabilities.reduce((sum, po) => sum + Number(po.totalAmount), 0);
    const equity = totalAssets - totalLiabilities;

    return {
      assets: { inventoryValue, cashOnHand, total: totalAssets },
      liabilities: { unpaidPurchaseOrders: totalLiabilities, total: totalLiabilities },
      equity,
      note: "Simplified/derived balance sheet — not a GAAP-compliant statement.",
    };
  },
};
