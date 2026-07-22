// Canonical sidebar/route access keys. Keep in sync with
// frontend/src/config/navKeys.ts — this list drives the Role Permissions
// admin UI and what RolePermission.allowedNavKeys can contain.
export const NAV_KEYS = [
  "dashboard",
  "pos",
  "orders",
  "tables",
  "menu",
  "qr",
  "inventory",
  "customers",
  "role-management",
  "reports",
  "pos-report",
  "expenses",
  "settings",
] as const;

export type NavKey = (typeof NAV_KEYS)[number];
