import { Router } from "express";
import { expensesController } from "./expenses.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createExpenseSchema, idParamSchema, updateExpenseSchema } from "./expenses.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/", expensesController.list);
router.post("/", validate({ body: createExpenseSchema }), expensesController.create);
router.put("/:id", validate({ params: idParamSchema, body: updateExpenseSchema }), expensesController.update);
router.delete("/:id", validate({ params: idParamSchema }), expensesController.remove);

export default router;
