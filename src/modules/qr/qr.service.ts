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
  async create(branchId: string) {
    const token = uuid();
    const targetUrl = `${env.clientUrl}/m/${token}`;
    const imageUrl = await generateQrImage(token, targetUrl);
    return qrRepository.create({ branchId, token, imageUrl });
  },

  // Every branch has exactly one QR code; create it lazily on first access
  // so existing branches (and newly created ones) always have one.
  async getOrCreate(branchId: string) {
    const existing = await qrRepository.findByBranch(branchId);
    if (existing) return existing;
    return qrService.create(branchId);
  },

  async regenerate(branchId: string) {
    const existing = await qrRepository.findByBranch(branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    deleteQrImage(existing.token);
    const token = uuid();
    const targetUrl = `${env.clientUrl}/m/${token}`;
    const imageUrl = await generateQrImage(token, targetUrl);
    return qrRepository.update(existing.id, { token, imageUrl, scanCount: 0 });
  },

  async toggle(branchId: string, isActive: boolean) {
    const existing = await qrRepository.findByBranch(branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    return qrRepository.update(existing.id, { isActive });
  },

  async getDownloadPath(branchId: string) {
    const existing = await qrRepository.findByBranch(branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    return existing.imageUrl;
  },

  async getPublicMenu(token: string) {
    const qr = await qrRepository.findByToken(token);
    if (!qr || !qr.isActive) {
      throw ApiError.notFound("This QR menu is not available");
    }
    await qrRepository.incrementScan(qr.id);

    const [branch, settings, categories, menuItems, tables] = await Promise.all([
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
      prisma.restaurantTable.findMany({
        where: { branchId: qr.branchId, status: { not: "RESERVED" } },
        orderBy: { code: "asc" },
        select: { id: true, name: true, code: true },
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
      tables,
      categories: categoriesWithItems,
    };
  },

  // Lets a customer scanning a QR code place an order without logging in.
  // Deliberately re-checks visibility (status/showOnQr/etc.) server-side so a
  // crafted request can never order a hidden, disabled, or POS-only item, and
  // never touches any data outside this one QR code's branch. The table (for
  // dine-in) is likewise re-validated against the branch, not trusted as-is.
  async placeOrder(
    token: string,
    input: {
      items: PublicOrderItem[];
      customerName?: string;
      customerPhone?: string;
      orderType?: "DINE_IN" | "TAKEAWAY";
      tableId?: string;
    }
  ) {
    const qr = await qrRepository.findByToken(token);
    if (!qr || !qr.isActive) {
      throw ApiError.notFound("This QR menu is not available");
    }

    const orderType = input.orderType === "DINE_IN" ? "DINE_IN" : "TAKEAWAY";
    let tableId: string | null = null;
    if (orderType === "DINE_IN") {
      if (!input.tableId) throw ApiError.badRequest("Select a table for dine-in orders");
      const table = await prisma.restaurantTable.findFirst({
        where: { id: input.tableId, branchId: qr.branchId },
      });
      if (!table) throw ApiError.badRequest("Selected table is not valid for this restaurant");
      tableId = table.id;
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
        tableId,
        orderType,
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

    if (tableId) {
      await prisma.restaurantTable.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" },
      });
    }

    return { orderNumber: order.orderNumber, total: Number(order.total), status: order.status };
  },
};
