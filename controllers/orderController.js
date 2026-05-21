import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { Cart } from "../models/cart.js";
import { Book } from "../models/book.js";
import HttpError from "../utils/httpError.js";

// ======================================
// ✅ CREATE ORDER
// ======================================
export const createOrder = async (
  req,
  res,
  next
) => {
  try {
    // ✅ get user cart
    const cart = await Cart.findOne({
      user: req.user.user_id,
    }).populate("items.product");

    // ✅ check empty cart
    if (
      !cart ||
      cart.items.length === 0
    ) {
      return next(
        new HttpError(
          "Cart is empty",
          400
        )
      );
    }

    // ✅ build order items
    const orderItems = cart.items.map((item) => {
      const sellerId =
        item.product?.seller_id ||
        item.product?.sellerId ||
        item.product?.user_id;

      if (!sellerId) {
        return next(
          new HttpError(
            "Book seller id is missing for an item in your cart",
            400
          )
        );
      }

      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        seller: sellerId,
      };
    });
    // ✅ total
    const totalPrice =
      orderItems.reduce(
        (acc, item) =>
          acc +
          item.price * item.quantity,
        0
      );

    // ✅ create order
    const order = await Order.create({
      user: req.user.user_id,
      items: orderItems,
      totalPrice,
      orderStatus: "placed",
    });

    // ✅ clear cart
    cart.items = [];
    await cart.save();

    // ✅ populate order
    const populatedOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "firstName lastName email"
        )
        .populate(
          "items.product"
        );

    return res.status(201).json({
      success: true,
      message:
        "Order placed successfully",
      data: populatedOrder,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message,
        500
      )
    );
  }
};

// ======================================
// ✅ USER ORDERS
// ======================================
export const getUserOrders = async (
  req,
  res,
  next
) => {
  try {
    const orders = await Order.find({
      user: req.user.user_id,
    })
      .populate(
        "items.product"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message,
        500
      )
    );
  }
};

// ======================================
// ✅ SINGLE ORDER
// ======================================
export const getSingleOrder = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    // ✅ validate id
    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return next(
        new HttpError(
          "Invalid order ID",
          400
        )
      );
    }

    const order = await Order.findById(
      id
    )
      .populate(
        "user",
        "firstName lastName email"
      )
      .populate(
        "items.product"
      );

    if (!order) {
      return next(
        new HttpError(
          "Order not found",
          404
        )
      );
    }

    // ✅ user can access own order
    // ✅ seller can access related order
    // ✅ admin can access all

    const isOwner =
      order.user._id.toString() === String(req.user.user_id);

    const isAdmin =
      req.user.role === "admin";

    const isSeller = order.items.some(
      (item) =>
        item.seller &&
        item.seller.toString() === String(req.user.user_id)
    );

    if (
      !isOwner &&
      !isAdmin &&
      !isSeller
    ) {
      return next(
        new HttpError(
          "Not authorized",
          403
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message,
        500
      )
    );
  }
};

// ======================================
// ✅ ADMIN ALL ORDERS
// ======================================
export const getAllOrders = async (
  req,
  res,
  next
) => {
  try {
    // ✅ admin only
    if (
      req.user.role !== "admin"
    ) {
      return next(
        new HttpError(
          "Admin only",
          403
        )
      );
    }

    const orders = await Order.find()
      .populate(
        "user",
        "firstName lastName email"
      )
      .populate(
        "items.product"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message,
        500
      )
    );
  }
};

// ======================================
// ✅ SELLER ORDERS
// ======================================
export const sellerOrders = async (
  req,
  res,
  next
) => {
  try {
    // ✅ seller/admin only
    if (
      req.user.role !== "seller" &&
      req.user.role !== "admin"
    ) {
      return next(
        new HttpError(
          "Seller only",
          403
        )
      );
    }

    const orders = await Order.find({
      "items.seller":
        req.user.user_id,
    })
      .populate(
        "user",
        "firstName lastName email"
      )
      .populate(
        "items.product"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message,
        500
      )
    );
  }
};

// ======================================
// ✅ UPDATE ORDER STATUS
// ======================================
export const updateOrderStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { id } = req.params;

      const { orderStatus } =
        req.body;

      // ✅ validate id
      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return next(
          new HttpError(
            "Invalid order ID",
            400
          )
        );
      }

      // ✅ validate role
      if (
        req.user.role !== "seller" &&
        req.user.role !== "admin"
      ) {
        return next(
          new HttpError(
            "Not authorized",
            403
          )
        );
      }

      const order =
        await Order.findById(id);

      if (!order) {
        return next(
          new HttpError(
            "Order not found",
            404
          )
        );
      }

      // ✅ seller can update only own product orders
      if (
        req.user.role !== "admin"
      ) {
        const hasSellerItem =
          order.items.some(
            (item) =>
              item.seller?.toString() ===
              req.user.user_id
          );

        if (!hasSellerItem) {
          return next(
            new HttpError(
              "Not your order",
              403
            )
          );
        }
      }

      // ✅ update status
      const validStatuses = [
        "placed",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(orderStatus)) {
        return next(
          new HttpError(
            "Invalid order status",
            400
          )
        );
      }

      order.orderStatus = orderStatus;

      await order.save();

      return res.status(200).json({
        success: true,
        message:
          "Order status updated",
        data: order,
      });
    } catch (err) {
      console.log(err);

      return next(
        new HttpError(
          err.message,
          500
        )
      );
    }
  };

// ======================================
// ✅ CANCEL ORDER
// ======================================
export const cancelOrder = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    // ✅ validate id
    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return next(
        new HttpError(
          "Invalid order ID",
          400
        )
      );
    }

    const order = await Order.findById(
      id
    );

    if (!order) {
      return next(
        new HttpError(
          "Order not found",
          404
        )
      );
    }

    // ✅ only owner/admin
    if (
      order.user.toString() !== String(req.user.user_id) &&
      req.user.role !== "admin"
    ) {
      return next(
        new HttpError(
          "Not authorized",
          403
        )
      );
    }

    // ✅ cannot cancel delivered
    if (
      order.orderStatus ===
      "delivered"
    ) {
      return next(
        new HttpError(
          "Delivered order cannot be cancelled",
          400
        )
      );
    }

    order.orderStatus =
      "cancelled";

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Order cancelled successfully",
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message,
        500
      )
    );
  }
};