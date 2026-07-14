import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

interface ListParams {
  branchId: string;
  page: number;
  limit: number;
  status?: string;
  orderType?: string;
  isHeld?: boolean;
  from?: string;
  to?: string;
}

const orderInclude = {
  items: { include: { menuItem: { select: { name: true, image: true } } } },
  payments: true,
  table: { select: { id: true, name: true, code: true } },
  customer: { select: { id: true, name: true, phone: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.OrderInclude;

export const ordersRepository = {
  async findMany(params: ListParams) {
    const where: Prisma.OrderWhereInput = {
      branchId: params.branchId,
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.orderType ? { orderType: params.orderType as never } : {}),
      ...(params.isHeld !== undefined ? { isHeld: params.isHeld } : {}),
      ...(params.from || params.to
        ? {
            createdAt: {
              ...(params.from ? { gte: new Date(params.from) } : {}),
              ...(params.to ? { lte: new Date(params.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string, branchId: string) {
    return prisma.order.findFirst({ where: { id, branchId }, include: orderInclude });
  },

  create(data: Prisma.OrderUncheckedCreateInput) {
    return prisma.order.create({ data, include: orderInclude });
  },

  update(id: string, data: Prisma.OrderUncheckedUpdateInput) {
    return prisma.order.update({ where: { id }, data, include: orderInclude });
  },

  replaceItems(orderId: string, items: Prisma.OrderItemUncheckedCreateInput[]) {
    return prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId } }),
      prisma.orderItem.createMany({ data: items }),
    ]);
  },

  addPayments(orderId: string, payments: { method: string; amount: number; transactionRef?: string }[]) {
    return prisma.payment.createMany({
      data: payments.map((p) => ({ ...p, orderId }) as never),
    });
  },

  findMenuItemsByIds(ids: string[], branchId: string) {
    return prisma.menuItem.findMany({
      where: { id: { in: ids }, branchId },
      include: { recipe: true },
    });
  },

  async deductInventoryForOrder(orderId: string) {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      include: { menuItem: { include: { recipe: true } } },
    });

    const deductions = new Map<string, number>();
    for (const item of items) {
      for (const recipe of item.menuItem.recipe) {
        const qty = Number(recipe.quantityPerUnit) * item.quantity;
        deductions.set(recipe.inventoryItemId, (deductions.get(recipe.inventoryItemId) ?? 0) + qty);
      }
    }

    if (deductions.size === 0) return;

    await prisma.$transaction(
      Array.from(deductions.entries()).flatMap(([inventoryItemId, qty]) => [
        prisma.inventoryItem.update({
          where: { id: inventoryItemId },
          data: { quantity: { decrement: qty } },
        }),
        prisma.stockMovement.create({
          data: {
            inventoryItemId,
            type: "STOCK_OUT",
            quantity: qty,
            reason: "Order completed",
            referenceOrderId: orderId,
          },
        }),
      ])
    );
  },

  countTodayOrders(branchId: string, since: Date) {
    return prisma.order.count({ where: { branchId, createdAt: { gte: since } } });
  },
};
