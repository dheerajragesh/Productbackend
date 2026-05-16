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

const router = express.Router();

// ================= USER ROUTES =================

// PLACE ORDER
router.post(
  "/place",
  authCheck,
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
  getSingleOrder
);

// CANCEL ORDER
router.delete(
  "/cancelorder/:id",
  authCheck,
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
  updateOrderStatus
);

export default router;