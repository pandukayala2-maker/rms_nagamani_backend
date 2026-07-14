import { Router } from "express";
import { branchesController } from "./branches.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createBranchSchema, idParamSchema, updateBranchSchema } from "./branches.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", branchesController.list);
router.post("/", validate({ body: createBranchSchema }), branchesController.create);
router.put("/:id", validate({ params: idParamSchema, body: updateBranchSchema }), branchesController.update);
router.delete("/:id", validate({ params: idParamSchema }), branchesController.remove);

export default router;
