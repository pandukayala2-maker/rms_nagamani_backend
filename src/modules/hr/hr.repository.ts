import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";

export const departmentRepository = {
  findMany(branchId: string) {
    return prisma.department.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  },
  findById(id: string, branchId: string) {
    return prisma.department.findFirst({ where: { id, branchId } });
  },
  create(data: Prisma.DepartmentUncheckedCreateInput) {
    return prisma.department.create({ data });
  },
  update(id: string, data: Prisma.DepartmentUncheckedUpdateInput) {
    return prisma.department.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.department.delete({ where: { id } });
  },
  countUsers(id: string) {
    return prisma.user.count({ where: { departmentId: id } });
  },
};

export const designationRepository = {
  findMany(branchId: string) {
    return prisma.designation.findMany({
      where: { branchId },
      include: { department: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  },
  findById(id: string, branchId: string) {
    return prisma.designation.findFirst({ where: { id, branchId } });
  },
  create(data: Prisma.DesignationUncheckedCreateInput) {
    return prisma.designation.create({ data });
  },
  update(id: string, data: Prisma.DesignationUncheckedUpdateInput) {
    return prisma.designation.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.designation.delete({ where: { id } });
  },
  countUsers(id: string) {
    return prisma.user.count({ where: { designationId: id } });
  },
};

export const shiftRepository = {
  findMany(branchId: string) {
    return prisma.shift.findMany({ where: { branchId }, orderBy: { startTime: "asc" } });
  },
  findById(id: string, branchId: string) {
    return prisma.shift.findFirst({ where: { id, branchId } });
  },
  create(data: Prisma.ShiftUncheckedCreateInput) {
    return prisma.shift.create({ data });
  },
  update(id: string, data: Prisma.ShiftUncheckedUpdateInput) {
    return prisma.shift.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.shift.delete({ where: { id } });
  },
  countUsers(id: string) {
    return prisma.user.count({ where: { shiftId: id } });
  },
};
