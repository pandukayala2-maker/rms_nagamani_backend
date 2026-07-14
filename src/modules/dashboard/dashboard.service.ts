import { prisma } from "../../config/prisma";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export const dashboardService = {
  async kpis(branchId: string) {
    const todayStart = startOfDay();

    const [
      todayOrders,
      todayCompletedOrders,
      activeMenuItems,
      hiddenMenuItems,
      inventoryItems,
      lowStockCount,
      customersCount,
      tablesCount,
    ] = await Promise.all([
      prisma.order.count({ where: { branchId, createdAt: { gte: todayStart } } }),
      prisma.order.findMany({
        where: { branchId, createdAt: { gte: todayStart }, status: "COMPLETED" },
        select: { total: true },
      }),
      prisma.menuItem.count({ where: { branchId, status: "ACTIVE" } }),
      prisma.menuItem.count({ where: { branchId, status: "HIDDEN" } }),
      prisma.inventoryItem.findMany({ where: { branchId }, select: { quantity: true, costPerUnit: true, reorderLevel: true } }),
      prisma.$queryRaw<
        { count: bigint }[]
      >`SELECT COUNT(*) as count FROM inventory_items WHERE "branchId" = ${branchId} AND quantity <= "reorderLevel"`,
      prisma.customer.count(),
      prisma.restaurantTable.count({ where: { branchId } }),
    ]);

    const todaySales = todayCompletedOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const inventoryValue = inventoryItems.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.costPerUnit),
      0
    );

    return {
      todaySales,
      todayOrders,
      revenue: todaySales,
      profit: Math.round(todaySales * 0.32 * 100) / 100,
      activeMenuItems,
      hiddenMenuItems,
      inventoryValue,
      lowStock: Number(lowStockCount[0]?.count ?? 0),
      customers: customersCount,
      tables: tablesCount,
    };
  },

  async dailySales(branchId: string, days = 7) {
    const since = daysAgo(days - 1);
    const orders = await prisma.order.findMany({
      where: { branchId, status: "COMPLETED", createdAt: { gte: since } },
      select: { total: true, createdAt: true },
    });
    return bucketByDay(orders, days);
  },

  async weeklySales(branchId: string, weeks = 8) {
    const since = daysAgo(weeks * 7 - 1);
    const orders = await prisma.order.findMany({
      where: { branchId, status: "COMPLETED", createdAt: { gte: since } },
      select: { total: true, createdAt: true },
    });
    return bucketByWeek(orders, weeks);
  },

  async monthlySales(branchId: string, months = 12) {
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
    const orders = await prisma.order.findMany({
      where: { branchId, status: "COMPLETED", createdAt: { gte: since } },
      select: { total: true, createdAt: true },
    });
    return bucketByMonth(orders, months);
  },

  async categorySales(branchId: string) {
    const items = await prisma.orderItem.findMany({
      where: { order: { branchId, status: "COMPLETED" } },
      include: { menuItem: { select: { categoryId: true, category: { select: { name: true } } } } },
    });
    const map = new Map<string, { category: string; revenue: number }>();
    for (const item of items) {
      const key = item.menuItem.categoryId;
      const existing = map.get(key) ?? { category: item.menuItem.category.name, revenue: 0 };
      existing.revenue += Number(item.subtotal);
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  },

  async topSellingItems(branchId: string, limit = 5) {
    const items = await prisma.orderItem.groupBy({
      by: ["menuItemId", "nameSnapshot"],
      where: { order: { branchId, status: "COMPLETED" } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });
    return items.map((i) => ({
      menuItemId: i.menuItemId,
      name: i.nameSnapshot,
      quantitySold: i._sum.quantity ?? 0,
      revenue: Number(i._sum.subtotal ?? 0),
    }));
  },

  async revenueTrends(branchId: string) {
    const [daily, monthly] = await Promise.all([
      this.dailySales(branchId, 14),
      this.monthlySales(branchId, 6),
    ]);
    return { daily, monthly };
  },
};

function bucketByDay(orders: { total: unknown; createdAt: Date }[], days: number) {
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const key = daysAgo(days - 1 - i).toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  for (const order of orders) {
    const key = startOfDay(order.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + Number(order.total));
  }
  return Array.from(buckets.entries()).map(([date, total]) => ({ date, total }));
}

function bucketByWeek(orders: { total: unknown; createdAt: Date }[], weeks: number) {
  const buckets: { label: string; start: Date; total: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = daysAgo(i * 7 + 6);
    buckets.push({ label: `Week of ${start.toISOString().slice(0, 10)}`, start, total: 0 });
  }
  for (const order of orders) {
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (order.createdAt >= buckets[i].start) {
        buckets[i].total += Number(order.total);
        break;
      }
    }
  }
  return buckets.map((b) => ({ week: b.label, total: b.total }));
}

function bucketByMonth(orders: { total: unknown; createdAt: Date }[], months: number) {
  const buckets: { label: string; year: number; month: number; total: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      total: 0,
    });
  }
  for (const order of orders) {
    const bucket = buckets.find(
      (b) => b.year === order.createdAt.getFullYear() && b.month === order.createdAt.getMonth()
    );
    if (bucket) bucket.total += Number(order.total);
  }
  return buckets.map((b) => ({ month: b.label, total: b.total }));
}
