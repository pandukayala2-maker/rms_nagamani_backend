import bcrypt from "bcryptjs";
import { authRepository } from "./auth.repository";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../config/logger";
import {
  generateOpaqueToken,
  hashToken,
  refreshTokenExpiryDate,
  resetTokenExpiryDate,
  signAccessToken,
  verifyAccessToken,
} from "../../utils/tokens";
import type { RegisterInput, LoginInput } from "./auth.validator";

const SALT_ROUNDS = 10;

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId: string | null;
  avatar: string | null;
  phone: string | null;
  isActive: boolean;
}) {
  const { id, name, email, role, branchId, avatar, phone, isActive } = user;
  return { id, name, email, role, branchId, avatar, phone, isActive };
}

async function issueTokens(user: {
  id: string;
  email: string;
  role: import("@prisma/client").Role;
  branchId: string | null;
}) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
  });

  const refreshToken = generateOpaqueToken();
  await authRepository.createRefreshToken(
    user.id,
    hashToken(refreshToken),
    refreshTokenExpiryDate()
  );

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("A user with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      branchId: input.branchId,
      phone: input.phone,
    });
    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) throw ApiError.unauthorized("Refresh token is required");
    const tokenHash = hashToken(refreshToken);
    const stored = await authRepository.findRefreshToken(tokenHash);
    if (!stored || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized("Refresh token is invalid or expired");
    }
    const user = await authRepository.findUserById(stored.userId);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Account is not active");
    }

    // Rotate: revoke old, issue new
    await authRepository.revokeRefreshToken(tokenHash);
    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    await authRepository.revokeRefreshToken(hashToken(refreshToken));
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    // Always respond as if successful to avoid user enumeration.
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return;
    }
    const resetToken = generateOpaqueToken();
    await authRepository.createPasswordResetToken(
      user.id,
      hashToken(resetToken),
      resetTokenExpiryDate()
    );
    // In production this would be emailed. Logged here for local/dev use.
    logger.info(`Password reset link for ${email}: /reset-password?token=${resetToken}`);
    return resetToken;
  },

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);
    const record = await authRepository.findValidPasswordResetToken(tokenHash);
    if (!record) {
      throw ApiError.badRequest("Reset token is invalid or has expired");
    }
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authRepository.updateUserPassword(record.userId, hashedPassword);
    await authRepository.markPasswordResetTokenUsed(record.id);
    await authRepository.revokeAllUserRefreshTokens(record.userId);
  },

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return sanitizeUser(user);
  },

  verifyAccessTokenRaw: verifyAccessToken,
};
