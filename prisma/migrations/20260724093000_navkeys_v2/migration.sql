-- Nav keys were expanded/renamed to match the new 4-module sidebar
-- structure (Admin / POS Counter / Menu / Accounts & Reports). Update the
-- previously-seeded RolePermission rows so MANAGER/CASHIER don't lose
-- access to pages that were simply renamed or split (e.g. the old generic
-- "reports" key is now "profit-loss" + "balance-sheet" + "pos-report").

UPDATE "role_permissions"
SET "allowedNavKeys" = ARRAY[
  'dashboard','branches','shifts','departments','designations','employees',
  'role-management','inventory','settings','pos','menu','qr','pos-report',
  'orders','profit-loss','balance-sheet','expenses','customers','tables',
  'chart-of-accounts'
]
WHERE "role" = 'ADMIN';

UPDATE "role_permissions"
SET "allowedNavKeys" = ARRAY[
  'dashboard','inventory','pos','menu','qr','orders','tables','customers',
  'profit-loss','balance-sheet','pos-report','expenses','chart-of-accounts'
]
WHERE "role" = 'MANAGER';

UPDATE "role_permissions"
SET "allowedNavKeys" = ARRAY['pos','orders','tables','customers']
WHERE "role" = 'CASHIER';
