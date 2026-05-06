import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateAdminInput, UpdateAdminInput } from "../validators/admin.validator";

// ════════════════════════════════════════════════════════════
// CREATE ADMIN — Sirf Super Admin kar sakta hai
// ════════════════════════════════════════════════════════════
export const createAdminService = async (data: CreateAdminInput) => {
  // Email already exist karta hai?
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ApiError(409, "An admin with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const admin = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "ADMIN", // Hamesha ADMIN — SUPER_ADMIN kabhi create nahi hoga is route se
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      isActive: true,
      createdAt: true,
    },
  });

  return admin;
};

// ════════════════════════════════════════════════════════════
// GET ALL ADMINS — list with pagination + search
// ════════════════════════════════════════════════════════════
export const getAllAdminsService = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where = {
    role: "ADMIN" as const,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  // Total count aur data ek saath lo (transaction)
  const [total, admins] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    admins,
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

// ════════════════════════════════════════════════════════════
// GET SINGLE ADMIN
// ════════════════════════════════════════════════════════════
export const getAdminByIdService = async (id: string) => {
  const admin = await prisma.user.findFirst({
    where: { id, role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return admin;
};

// ════════════════════════════════════════════════════════════
// UPDATE ADMIN
// ════════════════════════════════════════════════════════════
export const updateAdminService = async (
  id: string,
  data: UpdateAdminInput
) => {
  // Exist karta hai?
  const admin = await prisma.user.findFirst({
    where: { id, role: "ADMIN" },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.avatar && { avatar: data.avatar }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updated;
};

// ════════════════════════════════════════════════════════════
// TOGGLE ACTIVE STATUS — activate ya deactivate
// ════════════════════════════════════════════════════════════
export const toggleAdminStatusService = async (id: string) => {
  const admin = await prisma.user.findFirst({
    where: { id, role: "ADMIN" },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !admin.isActive },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  // Deactivate hone pe sab refresh tokens delete karo
  if (!updated.isActive) {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
  }

  return updated;
};

// ════════════════════════════════════════════════════════════
// DELETE ADMIN — permanently delete
// ════════════════════════════════════════════════════════════
export const deleteAdminService = async (id: string) => {
  const admin = await prisma.user.findFirst({
    where: { id, role: "ADMIN" },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // Cascade — refresh tokens pehle delete honge (schema mein onDelete: Cascade hai)
  await prisma.user.delete({ where: { id } });
};


// ════════════════════════════════════════════════════════════
// CHANGE PASSWORD — authenticated user apna password change kare
// ════════════════════════════════════════════════════════════
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  // Sab refresh tokens invalidate karo — re-login zaroori hoga
  await prisma.refreshToken.deleteMany({ where: { userId } });
};