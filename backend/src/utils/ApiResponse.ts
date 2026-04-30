import { Response } from "express";

// Har successful response ka ek standard format
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
};
