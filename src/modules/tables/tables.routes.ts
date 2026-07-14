import { Router } from "express";
import { tablesController } from "./tables.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createTableSchema,
  idParamSchema,
  mergeTablesSchema,
  updateTableSchema,
} from "./tables.validator";

const router = Router();

router.use(authenticate);

router.get("/", tablesController.list);

router.post(
  "/",
  authorize("ADMIN", "MANAGER"),
  validate({ body: createTableSchema }),
  tablesController.create
);

router.post(
  "/merge",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ body: mergeTablesSchema }),
  tablesController.merge
);

router.post(
  "/:id/split",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema }),
  tablesController.split
);

router.put(
  "/:id",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema, body: updateTableSchema }),
  tablesController.update
);

router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validate({ params: idParamSchema }),
  tablesController.remove
);

export default router;
