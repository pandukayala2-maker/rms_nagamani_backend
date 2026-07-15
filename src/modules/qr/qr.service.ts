import { v4 as uuid } from "uuid";
import { qrRepository } from "./qr.repository";
import { ApiError } from "../../utils/ApiError";
import { deleteQrImage, generateQrImage } from "../../utils/qrcode";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { generateOrderNumber } from "../orders/orders.service";

interface PublicOrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export const qrService = {
  list(branchId: string) {
    return qrRepository.findMany(branchId);
  },

  async create(branchId: string, input: { type: "BRANCH" | "TABLE"; tableId?: string }) {
    const token = uuid();
    const targetUrl = `${env.clientUrl}/m/${token}`;
    const imageUrl = await generateQrImage(token, targetUrl);
    return qrRepository.create({
      branchId,
      type: input.type,
      tableId: input.tableId,
      token,
      imageUrl,
    });
  },

  async regenerate(id: string, branchId: string) {
    const existing = await qrRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    deleteQrImage(existing.token);
    const token = uuid();
    const targetUrl = `${env.clientUrl}/m/${token}`;
    const imageUrl = await generateQrImage(token, targetUrl);
    return qrRepository.update(id, { token, imageUrl, scanCount: 0 });
  },

  async toggle(id: string, branchId: string, isActive: boolean) {
    const existing = await qrRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    return qrRepository.update(id, { isActive });
  },

  async getDownloadPath(id: string, branchId: string) {
    const existing = await qrRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    return existing.imageUrl;
  },

  async getPublicMenu(token: string) {
    const qr = await qrRepository.findByToken(token);
    if (!qr || !qr.isActive) {
      throw ApiError.notFound("This QR menu is not available");
    }
    await qrRepository.incrementScan(qr.id);

    const [branch, settings, categories, menuItems] = await Promise.all([
      prisma.branch.findUnique({ where: { id: qr.branchId } }),
      prisma.settings.findUnique({ where: { branchId: qr.branchId } }),
      prisma.category.findMany({
        where: { branchId: qr.branchId, isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.menuItem.findMany({
        where: {
          branchId: qr.branchId,
          status: "ACTIVE",
          isAvailable: true,
          showOnQr: true,
          posOnly: false,
          isTempHidden: false,
        },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    if (!branch) throw ApiError.notFound("Restaurant not found");

    const categoriesWithItems = categories
      .map((category) => ({
        ...category,
        items: menuItems.filter((item) => item.categoryId === category.id),
      }))
      .filter((category) => category.items.length > 0);

    return {
      restaurant: {
        name: settings?.restaurantName ?? branch.name,
        logo: settings?.logo ?? null,
        address: settings?.address ?? branch.address ?? null,
        contact: settings?.contact ?? branch.contact ?? null,
        currency: settings?.currency ?? branch.currency,
      },
      table: qr.type === "TABLE" ? await getTableInfo(qr.tableId) : null,
      categories: categoriesWithItems,
    };
  },

  // Lets a customer scanning a QR code place an order without logging in.
  // Deliberately re-checks visibility (status/showOnQr/etc.) server-side so a
  // crafted request can never order a hidden, disabled, or POS-only item, and
  // never touches any data outside this one QR code's branch/table.
  async placeOrder(
    token: string,
    input: { items: PublicOrderItem[]; customerName?: string; customerPhone?: string }
  ) {
    const qr = await qrRepository.findByToken(token);
    if (!qr || !qr.isActive) {
      throw ApiError.notFound("This QR menu is not available");
    }

    const requestedIds = input.items.map((i) => i.menuItemId);
    const visibleItems = await prisma.menuItem.findMany({
      where: {
        id: { in: requestedIds },
        branchId: qr.branchId,
        status: "ACTIVE",
        isAvailable: true,
        showOnQr: true,
        posOnly: false,
        isTempHidden: false,
      },
    });
    const visibleItemMap = new Map(visibleItems.map((m) => [m.id, m]));

    let subtotal = 0;
    let tax = 0;
    const orderItems = input.items.map((cartItem) => {
      const menuItem = visibleItemMap.get(cartItem.menuItemId);
      if (!menuItem) {
        throw ApiError.badRequest(`Item is no longer available on the menu`);
      }
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

    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        branchId: qr.branchId,
        tableId: qr.tableId,
        orderType: qr.type === "TABLE" ? "DINE_IN" : "TAKEAWAY",
        status: "PENDING",
        subtotal,
        discount: 0,
        tax,
        total,
        notes: input.customerName
          ? `Placed via QR by ${input.customerName}${input.customerPhone ? ` (${input.customerPhone})` : ""}`
          : "Placed via QR menu",
        items: { create: orderItems },
      },
    });

    if (qr.tableId) {
      await prisma.restaurantTable.update({
        where: { id: qr.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    return { orderNumber: order.orderNumber, total: Number(order.total), status: order.status };
  },
};

async function getTableInfo(tableId: string | null) {
  if (!tableId) return null;
  return prisma.restaurantTable.findUnique({
    where: { id: tableId },
    select: { id: true, name: true, code: true },
  });
}
