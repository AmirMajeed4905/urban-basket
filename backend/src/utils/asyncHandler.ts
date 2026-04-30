import { Request, Response, NextFunction } from "express";

// Ye wrapper har async controller ke around use hoga
// Isse har controller mein try/catch likhne ki zaroorat nahi
// Error apne aap errorHandler middleware tak pahunch jata hai

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
