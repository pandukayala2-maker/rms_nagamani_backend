import { Router } from "express";
import { qrController } from "./qr.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createQrSchema, idParamSchema } from "./qr.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

/**
 * @openapi
 * /qr-codes:
 *   get:
 *     summary: List QR codes for the current branch
 *     tags: [QR Codes]
 */
router.get("/", qrController.list);

router.post("/", validate({ body: createQrSchema }), qrController.create);

router.post("/:id/regenerate", validate({ params: idParamSchema }), qrController.regenerate);

router.patch("/:id/toggle", validate({ params: idParamSchema }), qrController.toggle);

router.get("/:id/download", validate({ params: idParamSchema }), qrController.download);

export default router;
