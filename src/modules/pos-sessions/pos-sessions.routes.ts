import { Router } from "express";
import { posSessionsController } from "./pos-sessions.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { closeSessionSchema, idParamSchema, openSessionSchema } from "./pos-sessions.validator";

const router = Router();

router.use(authenticate);

router.post(
  "/open",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ body: openSessionSchema }),
  posSessionsController.open
);

router.post(
  "/:id/close",
  authorize("ADMIN", "MANAGER", "CASHIER"),
  validate({ params: idParamSchema, body: closeSessionSchema }),
  posSessionsController.close
);

router.get("/current", authorize("ADMIN", "MANAGER", "CASHIER"), posSessionsController.current);

router.get("/", authorize("ADMIN", "MANAGER"), posSessionsController.list);

router.get(
  "/:id/report",
  authorize("ADMIN", "MANAGER"),
  validate({ params: idParamSchema }),
  posSessionsController.report
);

export default router;
