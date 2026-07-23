import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const inventoryRepository = {
  findMany(branchId: string) {
    return prisma.inventoryItem.findMany({
      where: { branchId },
      include: { supplier: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  },

  findLowStock(branchId: string) {
    return prisma.$queryRaw`
      SELECT * FROM inventory_items
      WHERE "branchId" = ${branchId} AND quantity <= "reorderLevel"
      ORDER BY name ASC
    `;
  },

  findById(id: string, branchId: string) {
    return prisma.inventoryItem.findFirst({ where: { id, branchId } });
  },

  create(data: Prisma.InventoryItemUncheckedCreateInput) {
    return prisma.inventoryItem.create({ data });
  },

  update(id: string, data: Prisma.InventoryItemUncheckedUpdateInput) {
    return prisma.inventoryItem.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.inventoryItem.delete({ where: { id } });
  },

  findMovements(inventoryItemId: string) {
    return prisma.stockMovement.findMany({
      where: { inventoryItemId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  createMovement(data: Prisma.StockMovementUncheckedCreateInput) {
    return prisma.stockMovement.create({ data });
  },

  listSuppliers(branchId: string) {
    return prisma.supplier.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  },

  createSupplier(data: Prisma.SupplierUncheckedCreateInput) {
    return prisma.supplier.create({ data });
  },

  listPurchaseOrders(branchId: string) {
    return prisma.purchaseOrder.findMany({
      where: { branchId },
      include: { supplier: { select: { name: true } }, items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  createPurchaseOrder(data: Prisma.PurchaseOrderUncheckedCreateInput) {
    return prisma.purchaseOrder.create({ data, include: { items: true } });
  },

  updatePurchaseOrderStatus(id: string, status: string) {
    return prisma.purchaseOrder.update({ where: { id }, data: { status: status as never } });
  },

  findPurchaseOrderById(id: string, branchId: string) {
    return prisma.purchaseOrder.findFirst({ where: { id, branchId }, include: { items: true } });
  },

  setPurchaseOrderPaid(id: string, isPaid: boolean) {
    return prisma.purchaseOrder.update({ where: { id }, data: { isPaid } });
  },
};
