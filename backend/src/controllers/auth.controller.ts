import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/ApiResponse";
import {
  loginService,
  refreshTokenService,
  logoutService,
  logoutAllDevicesService,
  getMeService,
  changePasswordService,
} from "../services/auth.service";

// ── Cookie options ────────────────────────────────────────────
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,       // JS se accessible nahi — XSS se bachao
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict" as const, // CSRF se bachao
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din milliseconds mein
  path: "/",
};

// ════════════════════════════════════════════════════════════
// POST /api/auth/login
// ════════════════════════════════════════════════════════════
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginService(req.body);

  // Refresh token HttpOnly cookie mein — client JS touch nahi kar sakta
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  sendResponse(res, 200, "Login successful", {
    user,
    accessToken, // Frontend Zustand memory mein rakhega
  });
});

// ════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// ════════════════════════════════════════════════════════════
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Refresh token cookie se lo
  const refreshToken = req.cookies?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshTokenService(refreshToken);

  // Naya refresh token cookie mein set karo (token rotation)
  res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

  sendResponse(res, 200, "Token refreshed", { accessToken });
});

// ════════════════════════════════════════════════════════════
// POST /api/auth/logout
// ════════════════════════════════════════════════════════════
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  await logoutService(refreshToken);

  // Cookie clear karo
  res.clearCookie("refreshToken", { path: "/" });

  sendResponse(res, 200, "Logged out successfully");
});

// ════════════════════════════════════════════════════════════
// POST /api/auth/logout-all
// ════════════════════════════════════════════════════════════
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await logoutAllDevicesService(req.user!.userId);

  res.clearCookie("refreshToken", { path: "/" });

  sendResponse(res, 200, "Logged out from all devices");
});

// ════════════════════════════════════════════════════════════
// GET /api/auth/me
// ════════════════════════════════════════════════════════════
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await getMeService(req.user!.userId);

  sendResponse(res, 200, "Profile fetched", user);
});

// ════════════════════════════════════════════════════════════
// PATCH /api/auth/change-password
// ════════════════════════════════════════════════════════════
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    await changePasswordService(req.user!.userId, req.body);

    // Password change ke baad logout — security ke liye
    res.clearCookie("refreshToken", { path: "/" });

    sendResponse(
      res,
      200,
      "Password changed successfully. Please login again."
    );
  }
);
