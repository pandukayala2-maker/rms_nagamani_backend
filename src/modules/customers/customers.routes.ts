import { Router } from "express";
import { customersController } from "./customers.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  adjustLoyaltySchema,
  createCustomerSchema,
  idParamSchema,
  updateCustomerSchema,
} from "./customers.validator";

const router = Router();

router.use(authenticate);

router.get("/", customersController.list);
router.post("/", validate({ body: createCustomerSchema }), customersController.create);
router.get("/:id/history", validate({ params: idParamSchema }), customersController.history);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateCustomerSchema }),
  customersController.update
);
router.post(
  "/:id/loyalty",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema, body: adjustLoyaltySchema }),
  customersController.adjustLoyalty
);

export default router;
