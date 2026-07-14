import { Router } from "express";
import { settingsController } from "./settings.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateSettingsSchema } from "./settings.validator";

const router = Router();

router.use(authenticate);

router.get("/", settingsController.get);
router.put("/", authorize("ADMIN"), validate({ body: updateSettingsSchema }), settingsController.update);

export default router;
