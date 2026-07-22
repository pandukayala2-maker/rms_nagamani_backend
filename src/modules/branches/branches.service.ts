import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { qrService } from "../qr/qr.service";

export const branchesService = {
  list() {
    return prisma.branch.findMany({ orderBy: { createdAt: "desc" } });
  },

  async create(input: Record<string, unknown>) {
    const branch = await prisma.branch.create({ data: input as never });
    await prisma.settings.create({
      data: { branchId: branch.id, restaurantName: branch.name },
    });
    await qrService.create(branch.id);
    return branch;
  },

  async update(id: string, input: Record<string, unknown>) {
    const existing = await prisma.branch.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Branch not found");
    return prisma.branch.update({ where: { id }, data: input as never });
  },

  async remove(id: string) {
    const existing = await prisma.branch.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Branch not found");
    await prisma.branch.delete({ where: { id } });
  },
};
