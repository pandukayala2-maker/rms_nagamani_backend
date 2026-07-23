import { Router } from "express";
import { inventoryController } from "./inventory.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createInventoryItemSchema,
  createPurchaseOrderSchema,
  createSupplierSchema,
  idParamSchema,
  setPurchaseOrderPaidSchema,
  stockMovementSchema,
  updateInventoryItemSchema,
} from "./inventory.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/low-stock", inventoryController.lowStock);
router.get("/suppliers", inventoryController.listSuppliers);
router.post("/suppliers", validate({ body: createSupplierSchema }), inventoryController.createSupplier);
router.get("/purchase-orders", inventoryController.listPurchaseOrders);
router.post(
  "/purchase-orders",
  validate({ body: createPurchaseOrderSchema }),
  inventoryController.createPurchaseOrder
);
router.post(
  "/purchase-orders/:id/receive",
  validate({ params: idParamSchema }),
  inventoryController.receivePurchaseOrder
);
router.patch(
  "/purchase-orders/:id/pay",
  validate({ params: idParamSchema, body: setPurchaseOrderPaidSchema }),
  inventoryController.setPurchaseOrderPaid
);

router.get("/", inventoryController.list);

router.post("/", validate({ body: createInventoryItemSchema }), inventoryController.create);

router.get("/:id/movements", validate({ params: idParamSchema }), inventoryController.movements);

router.post(
  "/:id/movements",
  validate({ params: idParamSchema, body: stockMovementSchema }),
  inventoryController.recordMovement
);

router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateInventoryItemSchema }),
  inventoryController.update
);

router.delete("/:id", validate({ params: idParamSchema }), inventoryController.remove);

export default router;
