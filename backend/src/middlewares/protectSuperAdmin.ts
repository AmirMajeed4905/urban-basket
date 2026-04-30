import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";

const getId = (id: string | string[] | undefined): string | undefined => {
  if (!id) return undefined;
  return Array.isArray(id) ? id[0] : id;
};

// Prevent SUPER_ADMIN modification/deletion
export const protectSuperAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetId = getId(req.params.id);

    if (!targetId) return next();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { role: true },
    });

    if (targetUser?.role === "SUPER_ADMIN") {
      throw new ApiError(403, "Super Admin cannot be modified or deleted");
    }

    next();
  } catch (error) {
    next(error);
  }
};