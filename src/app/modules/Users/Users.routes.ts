import express from "express";
import { USerController } from "./User.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/create-user", USerController.createUser);
// The code is checked against the signed-in account only, never globally.
router.post("/verifyEmail", auth(), USerController.verifyEmail);
router.post("/resendVerification", USerController.resendVerification);
router.post("/forgotPassword", USerController.forgotPassword);
router.post("/resetPassword", USerController.resetPassword);

// Owner or admin; checked in the controller.
router.get("/ById/:id", auth(), USerController.getUserById);
router.get("/ByEmail/:email", auth(), USerController.getUserByEmail);
router.patch("/updateUSerProfile/:id", auth(), USerController.updateUSerProfile);
export const USerRoutes = router;
