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
        // Allow non-browser requests (no Origin header) and any explicitly
        // trusted frontend URL.
        if (!origin || env.clientUrls.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
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
