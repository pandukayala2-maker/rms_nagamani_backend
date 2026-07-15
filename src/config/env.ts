import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  apiVersion: process.env.API_VERSION ?? "v1",

  databaseUrl: required("DATABASE_URL"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev_access_secret"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  resetPasswordSecret: required("RESET_PASSWORD_SECRET", "dev_reset_secret"),
  resetPasswordExpiresIn: process.env.RESET_PASSWORD_EXPIRES_IN ?? "15m",

  // Comma-separated list, so multiple frontend URLs (production domain, a
  // Vercel git-branch alias, preview deployments, etc.) can all be trusted
  // at once. The first entry is used wherever a single canonical URL is
  // needed (e.g. building QR code target links).
  clientUrls: (process.env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  get clientUrl() {
    return this.clientUrls[0];
  },
  cookieSecret: process.env.COOKIE_SECRET ?? "dev_cookie_secret",

  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 5),

  logLevel: process.env.LOG_LEVEL ?? "info",

  isProd: (process.env.NODE_ENV ?? "development") === "production",
};
