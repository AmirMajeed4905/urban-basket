import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateNoticeInput } from "../validators/notice.validator";

export const createNoticeService = async (data: CreateNoticeInput, createdById: string) => {
  return prisma.notice.create({
    data: {
      ...data,
      createdById,
      ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });
};

export const getAllNoticesService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {
    OR: [
      { expiresAt: null },
      { expiresAt: { gte: now } },
    ],
  };

  const [total, notices] = await prisma.$transaction([
    prisma.notice.count({ where }),
    prisma.notice.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      skip,
      take: limit,
    }),
  ]);

  return {
    notices,
    pagination: {
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateNoticeService = async (id: string, data: any) => {
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) throw new ApiError(404, "Notice not found");

  return prisma.notice.update({
    where: { id },
    data: {
      ...data,
      ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
    },
  });
};

export const deleteNoticeService = async (id: string) => {
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) throw new ApiError(404, "Notice not found");
  await prisma.notice.delete({ where: { id } });
};