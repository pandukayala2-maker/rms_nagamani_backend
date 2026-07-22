import type { Role } from "@prisma/client";
import { permissionsRepository } from "./permissions.repository";
import { NAV_KEYS } from "../../config/navKeys";

export const permissionsService = {
  list() {
    return permissionsRepository.findAll();
  },

  update(role: Role, allowedNavKeys: string[]) {
    return permissionsRepository.upsert(role, allowedNavKeys);
  },

  // ADMIN always has full access regardless of what's stored, so an admin
  // can never lock themselves (or every other admin) out of the app.
  async getMine(role: Role) {
    if (role === "ADMIN") {
      return { role, allowedNavKeys: [...NAV_KEYS] };
    }
    const row = await permissionsRepository.findByRole(role);
    return { role, allowedNavKeys: row?.allowedNavKeys ?? [] };
  },
};
