import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";
import { env } from "../../config/env";
import { asyncHandler } from "../../utils/asyncHandler";

const REFRESH_COOKIE = "refreshToken";

// In production the frontend (Vercel) and backend (Render) live on different
// domains, so the refresh cookie must be sent cross-site: that requires
// SameSite=None, which browsers only honor when Secure is also set (HTTPS).
// Locally, frontend/backend share an origin via the dev/nginx proxy, where
// Lax + non-Secure is what works over plain http://localhost.
const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: (env.isProd ? "none" : "lax") as "none" | "lax",
  path: "/api/" + env.apiVersion + "/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken, ...rest } = await authService.register(req.body);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    sendSuccess(res, rest, "Registered successfully", 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken, ...rest } = await authService.login(req.body);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    sendSuccess(res, rest, "Logged in successfully");
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
    const { refreshToken, ...rest } = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    sendSuccess(res, rest, "Token refreshed");
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
    await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: cookieOptions.path });
    sendSuccess(res, null, "Logged out successfully");
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, "If the email exists, a reset link has been sent");
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, "Password has been reset successfully");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    sendSuccess(res, user, "Current user fetched");
  }),
};
