import { Router } from "express";
import { menuController } from "./menu.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { idParamSchema, menuItemSchema, menuQuerySchema, updateMenuItemSchema } from "./menu.validator";
import { uploadImage, publicImagePath } from "../../middleware/upload";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /menu-items:
 *   get:
 *     summary: List menu items with search, filter, sort and pagination
 *     tags: [Menu]
 */
router.get("/", validate({ query: menuQuerySchema }), menuController.list);

router.get("/export", authorize("ADMIN", "MANAGER"), menuController.bulkExport);

router.post(
  "/import",
  authorize("ADMIN", "MANAGER"),
  menuController.bulkImport
);

router.post(
  "/upload-image",
  authorize("ADMIN", "MANAGER"),
  uploadImage.single("image"),
  asyncHandler(async (req, res) => {
    sendSuccess(res, { path: publicImagePath(req.file!.filename) }, "Image uploaded");
  })
);

router.get("/:id", validate({ params: idParamSchema }), menuController.getOne);

router.post(
  "/",
  authorize("ADMIN", "MANAGER"),
  validate({ body: menuItemSchema }),
  menuController.create
);

router.post(
  "/:id/duplicate",
  authorize("ADMIN", "MANAGER"),
  validate({ params: idParamSchema }),
  menuController.duplicate
);

router.put(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validate({ params: idParamSchema, body: updateMenuItemSchema }),
  menuController.update
);

router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validate({ params: idParamSchema }),
  menuController.remove
);

export default router;
