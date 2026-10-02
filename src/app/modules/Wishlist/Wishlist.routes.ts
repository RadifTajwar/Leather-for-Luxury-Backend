import express from "express";

import { WishlistController } from "./Wishlist.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/user/create-wishlist",
  auth(),
  WishlistController.createWishlist
);
router.get(
  "/user-wishlist/:id",
  auth(),
  WishlistController.getSingleUserWishlist
);
router.delete(
  "/user-wishlist/single-wishlist/:id",
  auth(),
  WishlistController.getSingleUserWishlist
);

export const WishlistRoutes = router;
