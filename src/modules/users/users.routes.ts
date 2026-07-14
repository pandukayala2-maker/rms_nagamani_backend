import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createStaffSchema, idParamSchema, updateStaffSchema } from "./users.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", usersController.list);
router.post("/", validate({ body: createStaffSchema }), usersController.create);
router.put("/:id", validate({ params: idParamSchema, body: updateStaffSchema }), usersController.update);
router.delete("/:id", validate({ params: idParamSchema }), usersController.remove);

export default router;
