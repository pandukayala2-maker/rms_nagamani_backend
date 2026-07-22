-- Collapse any existing per-table QR codes down to a single row per branch:
-- prefer the existing BRANCH-type row (or the newest row) and drop the rest.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "branchId"
           ORDER BY CASE WHEN "type" = 'BRANCH' THEN 0 ELSE 1 END, "createdAt" DESC
         ) AS rn
  FROM "qr_codes"
)
DELETE FROM "qr_codes" WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Backfill a QR code for any branch that doesn't have one yet (imageUrl is
-- generated lazily by the app on first regenerate/getOrCreate call).
INSERT INTO "qr_codes" ("id", "branchId", "token", "isActive", "scanCount", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, b."id", gen_random_uuid()::text, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "branches" b
WHERE NOT EXISTS (SELECT 1 FROM "qr_codes" q WHERE q."branchId" = b."id");

-- DropForeignKey
ALTER TABLE "qr_codes" DROP CONSTRAINT "qr_codes_tableId_fkey";

-- DropIndex
DROP INDEX "qr_codes_tableId_key";

-- DropIndex
DROP INDEX "qr_codes_branchId_idx";

-- AlterTable
ALTER TABLE "qr_codes" DROP COLUMN "tableId",
                        DROP COLUMN "type";

-- DropEnum
DROP TYPE "QrType";

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_branchId_key" ON "qr_codes"("branchId");
