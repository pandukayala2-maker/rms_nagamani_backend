import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QR Menu & POS Restaurant Management API",
      version: "1.0.0",
      description:
        "REST API for the QR Menu & POS Restaurant Management System — auth, menu, QR codes, POS/orders, inventory, dashboard analytics, and settings.",
    },
    servers: [{ url: `http://localhost:${env.port}/api/${env.apiVersion}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.routes.js"],
});
