import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateStaffInput, UpdateStaffInput, LeaveRequestInput } from "../validators/staff.validator";
import { StaffType } from "@prisma/client";

export const createStaffService = async (data: CreateStaffInput) => {
  const existing = await prisma.staff.findFirst({
    where: {
      OR: [
        { employeeNo: data.employeeNo },
        ...(data.cnic ? [{ cnic: data.cnic }] : []),
      ],
    },
  });
  if (existing) {
    throw new ApiError(409, existing.employeeNo === data.employeeNo
      ? "Employee number already exists"
      : "CNIC already exists"
    );
  }

  return prisma.staff.create({
    data: {
      ...data,
      salary: data.salary,
      joinDate: new Date(data.joinDate),
    },
  });
};

export const getAllStaffService = async (query: {
  page: number;
  limit: number;
  search?: string;
  staffType?: StaffType;
  isActive?: boolean;
}) => {
  const { page, limit, search, staffType, isActive } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(staffType && { staffType }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { employeeNo: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
      ],
    }),
  };

  const [total, staff] = await prisma.$transaction([
    prisma.staff.count({ where }),
    prisma.staff.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    staff,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

export const getStaffByIdService = async (id: string) => {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
  if (!staff) throw new ApiError(404, "Staff not found");
  return staff;
};

export const updateStaffService = async (id: string, data: UpdateStaffInput) => {
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw new ApiError(404, "Staff not found");

  return prisma.staff.update({
    where: { id },
    data: {
      ...data,
      ...(data.salary && { salary: data.salary }),
    },
  });
};

export const toggleStaffStatusService = async (id: string) => {
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw new ApiError(404, "Staff not found");

  return prisma.staff.update({
    where: { id },
    data: { isActive: !staff.isActive },
    select: { id: true, name: true, isActive: true },
  });
};

export const createLeaveRequestService = async (data: LeaveRequestInput) => {
  const staff = await prisma.staff.findUnique({ where: { id: data.staffId } });
  if (!staff) throw new ApiError(404, "Staff not found");

  const from = new Date(data.fromDate);
  const to = new Date(data.toDate);
  if (from > to) throw new ApiError(400, "From date cannot be after to date");

  return prisma.leaveRequest.create({
    data: {
      staffId: data.staffId,
      fromDate: from,
      toDate: to,
      reason: data.reason,
    },
  });
};

export const updateLeaveStatusService = async (id: string, status: "PENDING" | "APPROVED" | "REJECTED", approvedBy: string) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new ApiError(404, "Leave request not found");

  return prisma.leaveRequest.update({
    where: { id },
    data: {
      status,
      ...(status === "APPROVED" && { approvedBy }),
    },
  });
};

export const getStaffStatsService = async () => {
  const [total, teachers, active] = await prisma.$transaction([
    prisma.staff.count(),
    prisma.staff.count({ where: { staffType: "TEACHER" } }),
    prisma.staff.count({ where: { isActive: true } }),
  ]);
  return { total, teachers, active, inactive: total - active };
};


export const deleteStaffService = async (id: string) => {
  const staff = await prisma.staff.findUnique({ where: { id } });

  if (!staff) {
    throw new ApiError(404, "Staff not found");
  }

  return prisma.staff.delete({
    where: { id },
  });
};