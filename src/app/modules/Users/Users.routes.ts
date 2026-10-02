import express from "express";
import { USerController } from "./User.controller";

const router = express.Router();

router.post("/create-user", USerController.createUser);
router.post("/verifyEmail", USerController.verifyEmail);
router.post("/resendVerification", USerController.resendVerification);
router.post("/forgotPassword", USerController.forgotPassword);
router.post("/resetPassword", USerController.resetPassword);

router.get("/ById/:id", USerController.getUserById);
router.get("/ByEmail/:email", USerController.getUserByEmail);
router.patch("/updateUSerProfile/:id", USerController.updateUSerProfile);
export const USerRoutes = router;
