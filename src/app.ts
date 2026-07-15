import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { stream } from "./config/logger";
import { swaggerSpec } from "./config/swagger";
import apiRoutes from "./routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header), any explicitly
        // trusted URL, and any Vercel deployment (production, git-branch
        // alias, or per-commit preview) of this specific frontend project —
        // Vercel mints a new URL per deploy, so a fixed allowlist alone
        // breaks on every preview. A disallowed origin resolves to `false`
        // (browser blocks it as a normal CORS error) rather than throwing,
        // which previously surfaced as a 500 on the preflight request.
        const isKnownVercelDeploy = origin ? /^https:\/\/rms-ngamani-frontend[a-z0-9-]*\.vercel\.app$/.test(origin) : false;
        callback(null, !origin || env.clientUrls.includes(origin) || isKnownVercelDeploy);
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.cookieSecret));
  app.use(morgan("combined", { stream }));

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
  app.use(`/api/${env.apiVersion}`, limiter);

  app.use(`/${env.uploadDir}`, express.static(path.join(process.cwd(), env.uploadDir)));

  app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(`/api/${env.apiVersion}`, apiRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
