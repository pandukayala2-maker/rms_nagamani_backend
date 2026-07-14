import { v4 as uuid } from "uuid";
import { qrRepository } from "./qr.repository";
import { ApiError } from "../../utils/ApiError";
import { deleteQrImage, generateQrImage } from "../../utils/qrcode";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";

export const qrService = {
  list(branchId: string) {
    return qrRepository.findMany(branchId);
  },

  async create(branchId: string, input: { type: "BRANCH" | "TABLE"; tableId?: string }) {
    const token = uuid();
    const targetUrl = `${env.clientUrl}/m/${token}`;
    const imageUrl = await generateQrImage(token, targetUrl);
    return qrRepository.create({
      branchId,
      type: input.type,
      tableId: input.tableId,
      token,
      imageUrl,
    });
  },

  async regenerate(id: string, branchId: string) {
    const existing = await qrRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    deleteQrImage(existing.token);
    const token = uuid();
    const targetUrl = `${env.clientUrl}/m/${token}`;
    const imageUrl = await generateQrImage(token, targetUrl);
    return qrRepository.update(id, { token, imageUrl, scanCount: 0 });
  },

  async toggle(id: string, branchId: string, isActive: boolean) {
    const existing = await qrRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    return qrRepository.update(id, { isActive });
  },

  async getDownloadPath(id: string, branchId: string) {
    const existing = await qrRepository.findById(id, branchId);
    if (!existing) throw ApiError.notFound("QR code not found");
    return existing.imageUrl;
  },

  async getPublicMenu(token: string) {
    const qr = await qrRepository.findByToken(token);
    if (!qr || !qr.isActive) {
      throw ApiError.notFound("This QR menu is not available");
    }
    await qrRepository.incrementScan(qr.id);

    const [branch, settings, categories, menuItems] = await Promise.all([
      prisma.branch.findUnique({ where: { id: qr.branchId } }),
      prisma.settings.findUnique({ where: { branchId: qr.branchId } }),
      prisma.category.findMany({
        where: { branchId: qr.branchId, isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.menuItem.findMany({
        where: {
          branchId: qr.branchId,
          status: "ACTIVE",
          isAvailable: true,
          showOnQr: true,
          posOnly: false,
          isTempHidden: false,
        },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    if (!branch) throw ApiError.notFound("Restaurant not found");

    const categoriesWithItems = categories
      .map((category) => ({
        ...category,
        items: menuItems.filter((item) => item.categoryId === category.id),
      }))
      .filter((category) => category.items.length > 0);

    return {
      restaurant: {
        name: settings?.restaurantName ?? branch.name,
        logo: settings?.logo ?? null,
        address: settings?.address ?? branch.address ?? null,
        contact: settings?.contact ?? branch.contact ?? null,
        currency: settings?.currency ?? branch.currency,
      },
      table: qr.type === "TABLE" ? await getTableInfo(qr.tableId) : null,
      categories: categoriesWithItems,
    };
  },
};

async function getTableInfo(tableId: string | null) {
  if (!tableId) return null;
  return prisma.restaurantTable.findUnique({
    where: { id: tableId },
    select: { id: true, name: true, code: true },
  });
}
