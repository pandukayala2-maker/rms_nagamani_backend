import { menuRepository } from "./menu.repository";
import { ApiError } from "../../utils/ApiError";

interface ListQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  status?: string;
  isVeg?: boolean;
  sortBy: string;
  sortDir: "asc" | "desc";
}

const CSV_COLUMNS = [
  "itemCode",
  "name",
  "category",
  "subcategory",
  "price",
  "discountPrice",
  "tax",
  "status",
  "isVeg",
  "isFeatured",
  "isBestseller",
  "isAvailable",
] as const;

export const menuService = {
  async list(branchId: string, query: ListQuery) {
    const { items, total } = await menuRepository.findMany({ branchId, ...query });
    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getById(id: string, branchId: string) {
    const item = await menuRepository.findById(id, branchId);
    if (!item) throw ApiError.notFound("Menu item not found");
    return item;
  },

  async create(branchId: string, input: Record<string, unknown>) {
    return menuRepository.create({ ...input, branchId } as never);
  },

  async update(id: string, branchId: string, input: Record<string, unknown>) {
    await this.getById(id, branchId);
    return menuRepository.update(id, input as never);
  },

  async remove(id: string, branchId: string) {
    await this.getById(id, branchId);
    await menuRepository.remove(id);
  },

  async duplicate(id: string, branchId: string) {
    const original = await this.getById(id, branchId);
    const { id: _id, createdAt, updatedAt, category, ...rest } = original as never as Record<
      string,
      unknown
    >;
    return menuRepository.create({
      ...rest,
      itemCode: `${(rest.itemCode as string)}-COPY-${Date.now().toString().slice(-4)}`,
      name: `${rest.name as string} (Copy)`,
    } as never);
  },

  async bulkImport(branchId: string, items: Record<string, unknown>[]) {
    const data = items.map((item) => ({ ...item, branchId }) as never);
    const result = await menuRepository.createMany(data);
    return { imported: result.count };
  },

  async bulkExportCsv(branchId: string): Promise<string> {
    const items = await menuRepository.findAllForExport(branchId);
    const rows = items.map((item) => {
      const record: Record<string, unknown> = {
        ...item,
        category: (item as unknown as { category: { name: string } }).category?.name,
      };
      return CSV_COLUMNS.map((col) => escapeCsv(String(record[col] ?? ""))).join(",");
    });
    return [CSV_COLUMNS.join(","), ...rows].join("\n");
  },
};

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
