import express from "express";

import { ParentCategoryController } from "./ParentCategory.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/users";
import validateRequest from "../../middlewares/validateRequest";

import { ParentCategoryValidation } from "./ParentCategory.validation";

const router = express.Router();

router.post(
  "/create-parent",
  validateRequest(ParentCategoryValidation.ParentCategoryZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  ParentCategoryController.createParentCategory
);
router.get("/:slug", ParentCategoryController.getSingleParentCategoryBySlug);
router.get("/", ParentCategoryController.getAll);
router.get("/ById/:id", ParentCategoryController.getSingleParentCategoryById);
router.patch(
  "/update/:id",
  validateRequest(ParentCategoryValidation.UpdateParentCategoryZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  ParentCategoryController.updateParentCategoryById
);
router.delete(
  "/delete/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  ParentCategoryController.deleteParentCategory
);

export const ParentCategoryRoutes = router;
