import { Router } from "express";
import { departmentController, designationController, shiftController } from "./hr.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createDepartmentSchema,
  createDesignationSchema,
  createShiftSchema,
  idParamSchema,
  updateDepartmentSchema,
  updateDesignationSchema,
  updateShiftSchema,
} from "./hr.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/departments", departmentController.list);
router.post("/departments", validate({ body: createDepartmentSchema }), departmentController.create);
router.put(
  "/departments/:id",
  validate({ params: idParamSchema, body: updateDepartmentSchema }),
  departmentController.update
);
router.delete("/departments/:id", validate({ params: idParamSchema }), departmentController.remove);

router.get("/designations", designationController.list);
router.post("/designations", validate({ body: createDesignationSchema }), designationController.create);
router.put(
  "/designations/:id",
  validate({ params: idParamSchema, body: updateDesignationSchema }),
  designationController.update
);
router.delete("/designations/:id", validate({ params: idParamSchema }), designationController.remove);

router.get("/shifts", shiftController.list);
router.post("/shifts", validate({ body: createShiftSchema }), shiftController.create);
router.put(
  "/shifts/:id",
  validate({ params: idParamSchema, body: updateShiftSchema }),
  shiftController.update
);
router.delete("/shifts/:id", validate({ params: idParamSchema }), shiftController.remove);

export default router;
