import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../utils/prisma";

// Ye middleware SUPER_ADMIN user ko delete/deactivate hone se rokta hai
// Koi bhi route jisme kisi user ko modify ya delete kiya jata hai
// wahan ye middleware laga do

export const protectSuperAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetId = req.params.id;

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
