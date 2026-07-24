// Canonical sidebar/route access keys. Keep in sync with
// frontend/src/config/navKeys.ts and frontend/src/config/modules.ts — this
// list drives the Role Permissions admin UI and what
// RolePermission.allowedNavKeys can contain.
export const NAV_KEYS = [
  // Admin module
  "dashboard",
  "branches",
  "shifts",
  "departments",
  "designations",
  "employees",
  "role-management",
  "inventory",
  "settings",
  // POS Counter module
  "pos",
  // Menu module
  "menu",
  "qr",
  // Accounts & Reports module
  "pos-report",
  "orders",
  "profit-loss",
  "balance-sheet",
  "expenses",
  "customers",
  "tables",
  "chart-of-accounts",
] as const;

export type NavKey = (typeof NAV_KEYS)[number];
