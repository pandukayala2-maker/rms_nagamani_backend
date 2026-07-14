import { tablesRepository } from "./tables.repository";
import { ApiError } from "../../utils/ApiError";

export const tablesService = {
  list(branchId: string) {
    return tablesRepository.findMany(branchId);
  },

  create(branchId: string, input: Record<string, unknown>) {
    return tablesRepository.create({ ...input, branchId } as never);
  },

  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await tablesRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Table not found");
    return tablesRepository.update(id, input as never);
  },

  async remove(id: string, branchId: string) {
    const existing = await tablesRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("Table not found");
    await tablesRepository.remove(id);
  },

  async merge(branchId: string, sourceTableId: string, targetTableId: string) {
    const [source, target] = await Promise.all([
      tablesRepository.findById(sourceTableId, branchId),
      tablesRepository.findById(targetTableId, branchId),
    ]);
    if (!source || !target) throw ApiError.notFound("One or both tables were not found");
    await tablesRepository.update(sourceTableId, { status: "AVAILABLE", mergedInto: targetTableId });
    return tablesRepository.update(targetTableId, { status: "OCCUPIED" });
  },

  async split(branchId: string, tableId: string) {
    const table = await tablesRepository.findById(tableId, branchId);
    if (!table) throw ApiError.notFound("Table not found");
    return tablesRepository.update(tableId, { mergedInto: null });
  },
};
