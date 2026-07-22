import { Router } from "express";
import { qrController } from "./qr.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

/**
 * @openapi
 * /qr-codes:
 *   get:
 *     summary: Get (or lazily create) the current branch's single QR code
 *     tags: [QR Codes]
 */
router.get("/", qrController.get);

router.post("/regenerate", qrController.regenerate);

router.patch("/toggle", qrController.toggle);

router.get("/download", qrController.download);

export default router;
