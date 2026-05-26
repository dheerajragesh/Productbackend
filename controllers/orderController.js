import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { Cart } from "../models/cart.js";
import { Book } from "../models/Book.js";
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
    const requestedItems = Array.isArray(req.body?.items)
      ? req.body.items
      : [];

    let cart = null;
    let sourceItems = [];

    // ======================================
    // ✅ USE DIRECT ITEMS OR CART ITEMS
    // ======================================
    if (requestedItems.length > 0) {
      sourceItems = requestedItems;
    } else {
      cart = await Cart.findOne({
        user: req.user.user_id,
      }).populate("items.product");

      // ✅ check empty cart
      if (!cart || cart.items.length === 0) {
        return next(
          new HttpError(
            "Cart is empty",
            400
          )
        );
      }

      sourceItems = cart.items.map((item) => ({
        productId:
          item.product?._id || item.product,
        quantity: item.quantity,
        _product: item.product,
      }));
    }

    // ======================================
    // ✅ BUILD ORDER ITEMS
    // ======================================
    const orderItems = [];

    for (const item of sourceItems) {
      const quantity = Number(item.quantity || 1);

      const productId = String(
        item.productId ||
          item.product ||
          ""
      ).trim();

      // ✅ validate object id
      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return next(
          new HttpError(
            "Invalid book ID",
            400
          )
        );
      }

      // ✅ fetch product
      const product =
        item._product ||
        (await Book.findById(productId));

      if (!product || product.is_deleted) {
        return next(
          new HttpError(
            "Book not found",
            404
          )
        );
      }

      // ======================================
      // ✅ GET SELLER ID
      // ======================================
      const sellerId =
        product.seller?._id ||
        product.seller ||
        product.seller_id ||
        product.sellerId ||
        product.user?._id ||
        product.user ||
        product.user_id ||
        product.createdBy;

      if (!sellerId) {
        console.log(
          "❌ PRODUCT WITHOUT SELLER:",
          product
        );

        return next(
          new HttpError(
            "Book seller id is missing for an item in your cart",
            400
          )
        );
      }

      // ======================================
      // ✅ VALIDATE PRICE
      // ======================================
      const price = Number(product.price);

      if (Number.isNaN(price)) {
        return next(
          new HttpError(
            "Book price is missing for an item in your cart",
            400
          )
        );
      }

      // ======================================
      // ✅ PUSH ORDER ITEM
      // ======================================
      orderItems.push({
        product: product._id,
        quantity,
        price,
        seller: sellerId,
      });
    }

    // ======================================
    // ✅ CALCULATE TOTAL
    // ======================================
    const totalPrice = orderItems.reduce(
      (acc, item) =>
        acc + item.price * item.quantity,
      0
    );

    // ======================================
    // ✅ CREATE ORDER
    // ======================================
    const order = await Order.create({
      user: req.user.user_id,
      items: orderItems,
      totalPrice,
      address: (
        req.body?.address || ""
      ).trim(),
      paymentMethod:
        req.body?.paymentMethod || "COD",
      orderStatus: "placed",
    });

    // ======================================
    // ✅ CLEAR CART
    // ======================================
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // ======================================
    // ✅ POPULATE ORDER
    // ======================================
    const populatedOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "firstName lastName email"
        )
        .populate("items.product")
        .populate(
          "items.seller",
          "firstName lastName email"
        );

    return res.status(201).json({
      success: true,
      message:
        "Order placed successfully",
      data: populatedOrder,
    });
  } catch (err) {
    console.log("ERROR 👉", err);

    return next(
      new HttpError(
        err.message || "Server error",
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
      .populate("items.product")
      .populate(
        "items.seller",
        "firstName lastName email"
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

    // ✅ validate order id
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

    const order = await Order.findById(id)
      .populate(
        "user",
        "firstName lastName email"
      )
      .populate("items.product")
      .populate(
        "items.seller",
        "firstName lastName email"
      );

    if (!order) {
      return next(
        new HttpError(
          "Order not found",
          404
        )
      );
    }

    // ✅ authorization
    const isOwner =
      order.user._id.toString() ===
      String(req.user.user_id);

    const isAdmin =
      req.user.role === "admin";

    const isSeller = order.items.some(
      (item) =>
        item.seller &&
        item.seller._id.toString() ===
          String(req.user.user_id)
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
      .populate("items.product")
      .populate(
        "items.seller",
        "firstName lastName email"
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
      .populate("items.product")
      .populate(
        "items.seller",
        "firstName lastName email"
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

      // ✅ seller/admin only
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

      // ✅ seller can only update own orders
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

      // ✅ valid statuses
      const validStatuses = [
        "placed",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (
        !validStatuses.includes(
          orderStatus
        )
      ) {
        return next(
          new HttpError(
            "Invalid order status",
            400
          )
        );
      }

      order.orderStatus =
        orderStatus;

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

    // ✅ validate order id
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

    // ✅ find order
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

    // ✅ only owner or admin
    if (
      order.user.toString() !==
        String(req.user.user_id) &&
      req.user.role !== "admin"
    ) {
      return next(
        new HttpError(
          "Not authorized",
          403
        )
      );
    }

    // ✅ cannot cancel delivered order
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

    // ✅ update status
    order.orderStatus =
      "cancelled";

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Order cancelled successfully",
      data: order,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message || "Server error",
        500
      )
    );
  }
};