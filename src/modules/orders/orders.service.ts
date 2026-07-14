import { ordersRepository } from "./orders.repository";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";

interface CartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

async function priceItems(branchId: string, cartItems: CartItem[]) {
  const menuItems = await ordersRepository.findMenuItemsByIds(
    cartItems.map((i) => i.menuItemId),
    branchId
  );
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  let subtotal = 0;
  let tax = 0;
  const orderItems = cartItems.map((cartItem) => {
    const menuItem = menuItemMap.get(cartItem.menuItemId);
    if (!menuItem) throw ApiError.badRequest(`Menu item ${cartItem.menuItemId} not found`);
    const unitPrice = Number(menuItem.discountPrice ?? menuItem.price);
    const lineSubtotal = unitPrice * cartItem.quantity;
    const lineTax = (lineSubtotal * Number(menuItem.tax)) / 100;
    subtotal += lineSubtotal;
    tax += lineTax;
    return {
      menuItemId: menuItem.id,
      nameSnapshot: menuItem.name,
      priceSnapshot: unitPrice,
      quantity: cartItem.quantity,
      subtotal: lineSubtotal,
      notes: cartItem.notes,
    };
  });

  return { orderItems, subtotal, tax };
}

async function resolveCoupon(couponCode: string | undefined, subtotal: number) {
  if (!couponCode) return { couponId: undefined, couponDiscount: 0 };
  const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
  if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt < new Date())) {
    throw ApiError.badRequest("Coupon is invalid or has expired");
  }
  const discount =
    coupon.type === "PERCENT" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);
  return { couponId: coupon.id, couponDiscount: Math.min(discount, subtotal) };
}

function generateOrderNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 12);
  return `ORD-${stamp}-${Math.floor(Math.random() * 900 + 100)}`;
}

export const ordersService = {
  async list(branchId: string, query: Record<string, unknown>) {
    const { items, total } = await ordersRepository.findMany({ branchId, ...query } as never);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  },

  async getById(id: string, branchId: string) {
    const order = await ordersRepository.findById(id, branchId);
    if (!order) throw ApiError.notFound("Order not found");
    return order;
  },

  async create(
    branchId: string,
    createdById: string,
    input: {
      orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
      tableId?: string;
      customerId?: string;
      items: CartItem[];
      couponCode?: string;
      discount: number;
      notes?: string;
      isHeld: boolean;
    }
  ) {
    const { orderItems, subtotal, tax } = await priceItems(branchId, input.items);
    const { couponId, couponDiscount } = await resolveCoupon(input.couponCode, subtotal);
    const totalDiscount = couponDiscount + input.discount;
    const total = Math.max(0, subtotal - totalDiscount + tax);

    const order = await ordersRepository.create({
      orderNumber: generateOrderNumber(),
      branchId,
      tableId: input.tableId,
      customerId: input.customerId,
      orderType: input.orderType,
      couponId,
      subtotal,
      discount: totalDiscount,
      tax,
      total,
      notes: input.notes,
      isHeld: input.isHeld,
      createdById,
      items: { create: orderItems },
    } as never);

    if (input.tableId && !input.isHeld) {
      await prisma.restaurantTable.update({
        where: { id: input.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    return order;
  },

  async updateItems(id: string, branchId: string, items: CartItem[]) {
    await this.getById(id, branchId);
    const { orderItems, subtotal, tax } = await priceItems(branchId, items);
    const total = Math.max(0, subtotal - 0 + tax);
    await ordersRepository.replaceItems(
      id,
      orderItems.map((i) => ({ ...i, orderId: id }) as never)
    );
    return ordersRepository.update(id, { subtotal, tax, total } as never);
  },

  async resume(id: string, branchId: string) {
    await this.getById(id, branchId);
    return ordersRepository.update(id, { isHeld: false } as never);
  },

  async hold(id: string, branchId: string) {
    await this.getById(id, branchId);
    return ordersRepository.update(id, { isHeld: true } as never);
  },

  async updateStatus(id: string, branchId: string, status: string) {
    const order = await this.getById(id, branchId);
    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      throw ApiError.badRequest(`Cannot change status of a ${order.status.toLowerCase()} order`);
    }
    const updated = await ordersRepository.update(id, { status } as never);

    if (status === "CANCELLED" && order.tableId) {
      await prisma.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      });
    }
    return updated;
  },

  async addPayments(
    id: string,
    branchId: string,
    payments: { method: string; amount: number; transactionRef?: string }[]
  ) {
    const order = await this.getById(id, branchId);
    if (order.status === "COMPLETED") {
      throw ApiError.badRequest("Order is already fully paid");
    }
    await ordersRepository.addPayments(id, payments);

    const alreadyPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const newPaid = alreadyPaid + payments.reduce((sum, p) => sum + p.amount, 0);

    if (newPaid + 0.01 >= Number(order.total)) {
      const completed = await ordersRepository.update(id, { status: "COMPLETED" } as never);
      await ordersRepository.deductInventoryForOrder(id);
      if (order.tableId) {
        await prisma.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: "AVAILABLE" },
        });
      }
      return completed;
    }

    return this.getById(id, branchId);
  },

  async getReceiptData(id: string, branchId: string) {
    const order = await this.getById(id, branchId);
    const settings = await prisma.settings.findUnique({ where: { branchId } });
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    return {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      restaurantName: settings?.restaurantName ?? branch?.name ?? "Restaurant",
      address: settings?.address ?? branch?.address,
      contact: settings?.contact ?? branch?.contact,
      tableName: order.table?.name ?? null,
      orderType: order.orderType,
      items: order.items.map((i) => ({
        nameSnapshot: i.nameSnapshot,
        quantity: i.quantity,
        priceSnapshot: Number(i.priceSnapshot),
        subtotal: Number(i.subtotal),
      })),
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      tax: Number(order.tax),
      total: Number(order.total),
      payments: order.payments.map((p) => ({ method: p.method, amount: Number(p.amount) })),
    };
  },
};
