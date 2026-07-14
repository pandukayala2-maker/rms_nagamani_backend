import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

function membershipForPoints(points: number): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
  if (points >= 5000) return "PLATINUM";
  if (points >= 2000) return "GOLD";
  if (points >= 500) return "SILVER";
  return "BRONZE";
}

export const customersService = {
  list(search?: string) {
    return prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  create(input: Record<string, unknown>) {
    return prisma.customer.create({ data: input as never });
  },

  async update(id: string, input: Record<string, unknown>) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Customer not found");
    return prisma.customer.update({ where: { id }, data: input as never });
  },

  async history(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw ApiError.notFound("Customer not found");
    const orders = await prisma.order.findMany({
      where: { customerId: id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return { customer, orders };
  },

  async adjustLoyalty(id: string, points: number) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound("Customer not found");
    const newPoints = Math.max(0, existing.loyaltyPoints + points);
    return prisma.customer.update({
      where: { id },
      data: { loyaltyPoints: newPoints, membershipLevel: membershipForPoints(newPoints) },
    });
  },
};
