import express from "express";
import { BannerController } from "./Banner.controller";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/users";

const router = express.Router();

router.post(
  "/create-videoBanner",
  auth(ENUM_USER_ROLE.ADMIN),
  BannerController.createVideo
);
router.post(
  "/create-TopBanner",
  auth(ENUM_USER_ROLE.ADMIN),
  BannerController.createTopBanner
);

router.get("/Video-Banner/:id", BannerController.getSingleVideoBannerById);
router.get("/Top-Banner/:id", BannerController.getSingleTopBannerById);
router.patch(
  "/Update-Video-Banner/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  BannerController.updateVideoBannerById
);
router.patch(
  "/Update-Top-Banner/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  BannerController.updateTopBannerById
);

router.get("/all-TopBanner", BannerController.getAllTopBanner);
router.get("/all-VideoBanner", BannerController.getAllVideoBanner);

export const BannerRoutes = router;
