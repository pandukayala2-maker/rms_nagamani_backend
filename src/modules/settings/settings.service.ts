import { prisma } from "../../config/prisma";

export const settingsService = {
  async get(branchId: string) {
    const settings = await prisma.settings.findUnique({ where: { branchId } });
    if (settings) return settings;
    return prisma.settings.create({ data: { branchId } });
  },

  async update(branchId: string, input: Record<string, unknown>) {
    await this.get(branchId);
    return prisma.settings.update({ where: { branchId }, data: input as never });
  },
};
