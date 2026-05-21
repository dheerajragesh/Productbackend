import express from "express";
import authCheck from "../middleware/authCheck.js";

import {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

import { validationMiddleware } from "../utils/validateRequestMiddleware.js";
import {
  placeOrderValidation,
  getSingleOrderValidation,
  cancelOrderValidation,
  updateOrderStatusValidation,
} from "../validations/orderValidations.js";

const router = express.Router();

// ================= USER ROUTES =================

// PLACE ORDER
router.post(
  "/place",
  authCheck,
  placeOrderValidation,
  validationMiddleware,
  createOrder
);

// MY ORDERS
router.get(
  "/my-orders",
  authCheck,
  getUserOrders
);

// SINGLE ORDER
router.get(
  "/getorder/:id",
  authCheck,
  getSingleOrderValidation,
  validationMiddleware,
  getSingleOrder
);

// CANCEL ORDER
router.delete(
  "/cancelorder/:id",
  authCheck,
  cancelOrderValidation,
  validationMiddleware,
  cancelOrder
);

// ================= SELLER / ADMIN =================

// ALL ORDERS
router.get(
  "/all-orders",
  authCheck,
  getAllOrders
);

// UPDATE ORDER STATUS
router.put(
  "/updateorder/:id",
  authCheck,
  updateOrderStatusValidation,
  validationMiddleware,
  updateOrderStatus
);

export default router;
