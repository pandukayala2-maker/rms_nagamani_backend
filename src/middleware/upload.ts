import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const IMAGE_DIR = path.join(process.cwd(), env.uploadDir, "images");

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGE_DIR),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export const uploadImage = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(ApiError.badRequest("Only PNG, JPG, and WEBP images are allowed"));
    }
    cb(null, true);
  },
});

export function publicImagePath(fileName: string): string {
  return `/${env.uploadDir}/images/${fileName}`;
}
