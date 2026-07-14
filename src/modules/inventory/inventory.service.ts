import { inventoryRepository } from "./inventory.repository";
import { ApiError } from "../../utils/ApiError";

export const inventoryService = {
  list(branchId: string) {
    return inventoryRepository.findMany(branchId);
  },

  lowStock(branchId: string) {
    return inventoryRepository.findLowStock(branchId);
  },

  create(branchId: string, input: Record<string, unknown>) {
    return inventoryRepository.create({ ...input, branchId } as never);
  },

  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await inventoryRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Inventory item not found");
    return inventoryRepository.update(id, input as never);
  },

  async remove(id: string, branchId: string) {
    const existing = await inventoryRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Inventory item not found");
    await inventoryRepository.remove(id);
  },

  async movements(id: string, branchId: string) {
    const existing = await inventoryRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Inventory item not found");
    return inventoryRepository.findMovements(id);
  },

  async recordMovement(
    id: string,
    branchId: string,
    userId: string,
    input: { type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "WASTE"; quantity: number; reason?: string }
  ) {
    const existing = await inventoryRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Inventory item not found");

    const delta = input.type === "STOCK_IN" ? input.quantity : -input.quantity;
    const newQuantity = Number(existing.quantity) + delta;
    if (newQuantity < 0) {
      throw ApiError.badRequest("Resulting stock quantity cannot be negative");
    }

    await inventoryRepository.createMovement({
      inventoryItemId: id,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      createdById: userId,
    });

    return inventoryRepository.update(id, { quantity: newQuantity });
  },

  listSuppliers(branchId: string) {
    return inventoryRepository.listSuppliers(branchId);
  },

  createSupplier(branchId: string, input: Record<string, unknown>) {
    return inventoryRepository.createSupplier({ ...input, branchId } as never);
  },

  listPurchaseOrders(branchId: string) {
    return inventoryRepository.listPurchaseOrders(branchId);
  },

  createPurchaseOrder(
    branchId: string,
    input: { supplierId: string; items: { inventoryItemId: string; quantity: number; unitCost: number }[] }
  ) {
    const totalAmount = input.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    return inventoryRepository.createPurchaseOrder({
      branchId,
      supplierId: input.supplierId,
      totalAmount,
      items: { create: input.items },
    } as never);
  },

  async receivePurchaseOrder(id: string, branchId: string, userId: string) {
    const po = await inventoryRepository.findPurchaseOrderById(id, branchId);
    if (!po) throw ApiError.notFound("Purchase order not found");
    if (po.status === "RECEIVED") throw ApiError.badRequest("Purchase order already received");

    for (const item of po.items) {
      await this.recordMovement(item.inventoryItemId, branchId, userId, {
        type: "STOCK_IN",
        quantity: Number(item.quantity),
        reason: `Purchase order ${po.id}`,
      });
    }
    return inventoryRepository.updatePurchaseOrderStatus(id, "RECEIVED");
  },
};
