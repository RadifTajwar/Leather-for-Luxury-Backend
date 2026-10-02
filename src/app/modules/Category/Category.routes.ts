import express from "express";

import { CategoryController } from "./Category.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/users";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidation } from "./Category.validation";

const router = express.Router();

router.post(
  "/create-category",
  validateRequest(CategoryValidation.CategoryZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  CategoryController.createCategory
);
router.get("/:slug", CategoryController.getSingleCategoryBySlug);
router.get("/", CategoryController.getAll);
router.get("/ById/:id", CategoryController.getSingleCategoryById);
router.get("/Parent/:id", CategoryController.getParent);
router.patch(
  "/update/:id",
  validateRequest(CategoryValidation.CategoryUpdateZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  CategoryController.updateCategoryById
);
router.delete(
  "/delete/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
