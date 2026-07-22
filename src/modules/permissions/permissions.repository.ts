import { prisma } from "../../config/prisma";
import type { Role } from "@prisma/client";

export const permissionsRepository = {
  findAll() {
    return prisma.rolePermission.findMany({ orderBy: { role: "asc" } });
  },
  findByRole(role: Role) {
    return prisma.rolePermission.findUnique({ where: { role } });
  },
  upsert(role: Role, allowedNavKeys: string[]) {
    return prisma.rolePermission.upsert({
      where: { role },
      create: { role, allowedNavKeys },
      update: { allowedNavKeys },
    });
  },
};
