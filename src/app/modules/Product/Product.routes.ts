import express from "express";
import { ProductController } from "./Product.controller";
import { RatingController } from "../Rating/Rating.controller";
import validateRequest from "../../middlewares/validateRequest";
import { RatingZODSchema } from "../Rating/Rating.validation";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/users";

const router = express.Router();

router.post(
  "/create-product",
  auth(ENUM_USER_ROLE.ADMIN),
  ProductController.createProduct
);
router.get("/:slug", ProductController.getSingleProductBySlug);
router.get("/", ProductController.getAll);
router.get("/ById/:id", ProductController.getSingleProductById);
router.get("/product/:id", RatingController.getRatingByProduct);
router.patch(
  "/update/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  ProductController.updateProductById
);
router.delete(
  "/delete/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  ProductController.deleteProduct
);
router.post(
  "/rating",
  validateRequest(RatingZODSchema),
  // auth(ENUM_USER_ROLE.USER),
  RatingController.createRating
);
router.get("/all/colors", ProductController.getAllUniqueColor);

export const ProductRoutes = router;
