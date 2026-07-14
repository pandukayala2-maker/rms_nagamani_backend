import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

function sanitize(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
}) {
  const { id, name, email, role, phone, avatar, isActive, createdAt } = user;
  return { id, name, email, role, phone, avatar, isActive, createdAt };
}

export const usersService = {
  async list(branchId: string) {
    const users = await prisma.user.findMany({ where: { branchId }, orderBy: { createdAt: "desc" } });
    return users.map(sanitize);
  },

  async create(branchId: string, input: { name: string; email: string; password: string; role: "ADMIN" | "MANAGER" | "CASHIER"; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict("A user with this email already exists");
    const hashed = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: { ...input, password: hashed, branchId },
    });
    return sanitize(user);
  },

  async update(id: string, branchId: string, input: Record<string, unknown>) {
    const existing = await prisma.user.findFirst({ where: { id, branchId } });
    if (!existing) throw ApiError.notFound("Staff member not found");
    const updated = await prisma.user.update({ where: { id }, data: input as never });
    return sanitize(updated);
  },

  async remove(id: string, branchId: string) {
    const existing = await prisma.user.findFirst({ where: { id, branchId } });
    if (!existing) throw ApiError.notFound("Staff member not found");
    await prisma.user.delete({ where: { id } });
  },
};
