import { Router } from "express";
import { accountsController } from "./accounts.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createAccountSchema, idParamSchema, updateAccountSchema } from "./accounts.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/", accountsController.list);
router.post("/", validate({ body: createAccountSchema }), accountsController.create);
router.put("/:id", validate({ params: idParamSchema, body: updateAccountSchema }), accountsController.update);
router.delete("/:id", validate({ params: idParamSchema }), accountsController.remove);

export default router;
