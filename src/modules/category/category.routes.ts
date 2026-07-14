import { Router } from "express";
import { categoryController } from "./category.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCategorySchema, idParamSchema, updateCategorySchema } from "./category.validator";
import { uploadImage, publicImagePath } from "../../middleware/upload";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: List categories for the current branch
 *     tags: [Categories]
 */
router.get("/", categoryController.list);

router.post(
  "/",
  authorize("ADMIN", "MANAGER"),
  validate({ body: createCategorySchema }),
  categoryController.create
);

router.post(
  "/upload-image",
  authorize("ADMIN", "MANAGER"),
  uploadImage.single("image"),
  asyncHandler(async (req, res) => {
    sendSuccess(res, { path: publicImagePath(req.file!.filename) }, "Image uploaded");
  })
);

router.put(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  categoryController.update
);

router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validate({ params: idParamSchema }),
  categoryController.remove
);

export default router;
