import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

const QR_DIR = path.join(process.cwd(), env.uploadDir, "qrcodes");

if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

export async function generateQrImage(token: string, targetUrl: string): Promise<string> {
  const fileName = `${token}.png`;
  const filePath = path.join(QR_DIR, fileName);
  await QRCode.toFile(filePath, targetUrl, {
    width: 512,
    margin: 2,
    color: { dark: "#111827", light: "#ffffff" },
  });
  return `/${env.uploadDir}/qrcodes/${fileName}`;
}

export function deleteQrImage(token: string): void {
  const filePath = path.join(QR_DIR, `${token}.png`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
