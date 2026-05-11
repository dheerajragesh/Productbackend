import { Order } from "../models/order.js";
import HttpError from "../utils/HttpError.js";

// ================= CREATE ORDER =================
export const createOrder = async (req, res, next) => {
  try {
    const { items, totalAmount, address } = req.body;

    if (!items || items.length === 0) {
      return next(new HttpError("Order items required", 400));
    }

    const order = await Order.create({
      user: req.user.user_id,
      items,
      totalAmount,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= USER ORDERS =================
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.user_id })
      .populate("items.productId");

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= SINGLE ORDER =================
export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId");

    if (!order) {
      return next(new HttpError("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= SELLER - ALL ORDERS =================
export const getAllOrders = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return next(new HttpError("Not authorized", 403));
    }

    const orders = await Order.find()
      .populate("items.productId")
      .populate("user");

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= UPDATE ORDER STATUS (SELLER) =================
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!req.user || req.user.role !== "seller") {
      return next(new HttpError("Not authorized", 403));
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return next(new HttpError("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= CANCEL ORDER (USER ONLY) =================
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new HttpError("Order not found", 404));
    }

    if (!req.user) {
      return next(new HttpError("Not authenticated", 401));
    }

    if (order.user.toString() !== req.user.user_id) {
      return next(new HttpError("Not authorized", 403));
    }

    if (order.status === "delivered") {
      return next(new HttpError("Cannot cancel delivered order", 400));
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};