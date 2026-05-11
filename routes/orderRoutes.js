import express from "express";
import authCheck from "../middleware/authCheck.js";
import {
  createOrder,
  getUserOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

// USER
router.post("/place", authCheck, createOrder);
router.get("/my-orders", authCheck, getUserOrders);
router.get("/getorder/:id", authCheck, getSingleOrder);

// SELLER
router.get("/all-orders", authCheck, getAllOrders);
router.put("/updateorder/:id", authCheck, updateOrderStatus);

// USER CANCEL
router.delete("/cancelorder/:id", authCheck, cancelOrder);

export default router;