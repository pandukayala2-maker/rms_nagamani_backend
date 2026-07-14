import { Router } from "express";
import { ordersController } from "./orders.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  addPaymentSchema,
  createOrderSchema,
  idParamSchema,
  listOrdersQuerySchema,
  updateOrderItemsSchema,
  updateStatusSchema,
} from "./orders.validator";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List orders with filters and pagination
 *     tags: [Orders / POS]
 */
router.get("/", validate({ query: listOrdersQuerySchema }), ordersController.list);

router.get("/:id", validate({ params: idParamSchema }), ordersController.getOne);

router.post(
  "/",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ body: createOrderSchema }),
  ordersController.create
);

router.put(
  "/:id/items",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema, body: updateOrderItemsSchema }),
  ordersController.updateItems
);

router.post(
  "/:id/hold",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema }),
  ordersController.hold
);

router.post(
  "/:id/resume",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema }),
  ordersController.resume
);

router.patch(
  "/:id/status",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema, body: updateStatusSchema }),
  ordersController.updateStatus
);

router.post(
  "/:id/payments",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema, body: addPaymentSchema }),
  ordersController.addPayments
);

router.get("/:id/receipt", validate({ params: idParamSchema }), ordersController.receipt);

export default router;
