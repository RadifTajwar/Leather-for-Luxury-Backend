import express from "express";
import validateRequest from "./../../middlewares/validateRequest";
import { OderController } from "./Oder.controller";
import { OrderValidation } from "./Oder.validation";
import auth from "../../middlewares/auth";
import { ENUM_USER_ROLE } from "../../../enums/users";
const router = express.Router();

// Guest checkout: placing an order needs no account.
router.post(
  "/create-order",
  validateRequest(OrderValidation.OrderZodSchema),
  OderController.createOder
);

// Owner or admin; checked in the controller.
router.get("/User/:email", auth(), OderController.getOrderByUser);
// Stays open: guests see their order-received page by its unguessable id.
router.get("/ById/:id", OderController.getSingleOrderById);
router.get("/all-order", auth(ENUM_USER_ROLE.ADMIN), OderController.getAll);
router.patch(
  "/update/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  validateRequest(OrderValidation.UpdateOrderZodSchema),
  OderController.updateOderById
);
router.delete(
  "/delete/:id",
  auth(ENUM_USER_ROLE.ADMIN),
  OderController.deleteOrder
);
export const OderRoutes = router;
