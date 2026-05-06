import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { env } from "../config/env";
import { LoginInput, ChangePasswordInput } from "../validators/auth.validator";

// ── Helper: refresh token expiry date calculate karo ─────────
const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(env.REFRESH_TOKEN_EXPIRES_IN) || 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// ── Helper: token pair generate karo aur DB mein save karo ───
const issueTokens = async (userId: string, role: string) => {
  // Pehle access token banao
  const accessToken = generateAccessToken({
    userId,
    role: role as any,
  });

  // Refresh token ka DB record banao (id milegi)
  const tokenRecord = await prisma.refreshToken.create({
    data: {
      token: "placeholder", // pehle record banate hain id lene ke liye
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  // Ab actual refresh token banao jisme tokenId (DB id) bhi ho
  const refreshToken = generateRefreshToken({
    userId,
    tokenId: tokenRecord.id,
  });

  // Token ko DB record mein update karo
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { token: refreshToken },
  });

  return { accessToken, refreshToken };
};

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
export const loginService = async (data: LoginInput) => {
  const { email, password } = data;

  // 1. User dhundo
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Security: email aur password dono ek jaise error do
    // taake attacker ko pata na chale konsa exist karta hai
    throw new ApiError(401, "Invalid email or password");
  }

  // 2. Account active hai?
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Contact Super Admin.");
  }

  // 3. Password verify karo
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 4. Tokens generate karo
  const { accessToken, refreshToken } = await issueTokens(user.id, user.role);

  // 5. Sensitive fields hata ke user return karo
  const { password: _, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
};

// ════════════════════════════════════════════════════════════
// REFRESH TOKEN — naya access token do
// ════════════════════════════════════════════════════════════
export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  // 1. Token verify karo
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // 2. DB mein check karo — token exist karta hai?
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new ApiError(401, "Refresh token not found. Please login again.");
  }

  // 3. Token DB record se match karta hai?
  if (tokenRecord.token !== refreshToken) {
    // Token reuse attack — sabhi tokens delete karo (token rotation security)
    await prisma.refreshToken.deleteMany({
      where: { userId: payload.userId },
    });
    throw new ApiError(401, "Token reuse detected. Please login again.");
  }

  // 4. Expiry check
  if (tokenRecord.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    throw new ApiError(401, "Refresh token expired. Please login again.");
  }

  // 5. User active hai?
  if (!tokenRecord.user.isActive) {
    throw new ApiError(403, "Account deactivated.");
  }

  // 6. Old token delete karo (token rotation — har refresh pe naya token)
  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

  // 7. Naya token pair issue karo
  const tokens = await issueTokens(tokenRecord.userId, tokenRecord.user.role);

  return tokens;
};

// ════════════════════════════════════════════════════════════
// LOGOUT — token invalidate karo
// ════════════════════════════════════════════════════════════
export const logoutService = async (refreshToken: string) => {
  if (!refreshToken) return; // Already logged out

  try {
    const payload = verifyRefreshToken(refreshToken);
    // DB se token delete karo
    await prisma.refreshToken.deleteMany({
      where: { id: payload.tokenId },
    });
  } catch {
    // Token invalid hai — koi baat nahi, logout ho hi chuka hai
  }
};

// ════════════════════════════════════════════════════════════
// LOGOUT ALL DEVICES — sab refresh tokens delete karo
// ════════════════════════════════════════════════════════════
export const logoutAllDevicesService = async (userId: string) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

// ════════════════════════════════════════════════════════════
// GET ME — apni profile
// ════════════════════════════════════════════════════════════
export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// ════════════════════════════════════════════════════════════
// CHANGE PASSWORD
// ════════════════════════════════════════════════════════════
export const changePasswordService = async (
  userId: string,
  data: ChangePasswordInput
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  // Current password verify karo
  const isValid = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Naya password hash karo
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  // Update karo aur sab refresh tokens delete karo (security)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);
};

