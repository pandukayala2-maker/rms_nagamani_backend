import { Router } from "express";
import { permissionsController } from "./permissions.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { roleParamSchema, updatePermissionSchema } from "./permissions.validator";

const router = Router();

router.get("/mine", authenticate, permissionsController.mine);

router.get("/", authenticate, authorize("ADMIN"), permissionsController.list);
router.put(
  "/:role",
  authenticate,
  authorize("ADMIN"),
  validate({ params: roleParamSchema, body: updatePermissionSchema }),
  permissionsController.update
);

export default router;
