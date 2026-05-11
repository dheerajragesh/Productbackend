import { Cart } from "../models/cart.js";
import HttpError from "../utils/httpError.js";
import mongoose from "mongoose";

// ➕ ADD TO CART
export const addToCart = async (req, res, next) => {
  try {
    const { product, quantity = 1 } = req.body;
    const bookId = product?.trim();

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return next(new HttpError("Invalid book ID", 400));
    }

    let cart = await Cart.findOne({ user: req.user.user_id });

    if (!cart) {
      cart = new Cart({ user: req.user.user_id, items: [] });
    }

    // Match field name 'product' from your schema
    const index = cart.items.findIndex(
      (item) => item.product.toString() === bookId
    );

    if (index > -1) {
      cart.items[index].quantity += Number(quantity);
    } else {
      cart.items.push({ product: bookId, quantity: Number(quantity) });
    }

    await cart.save();
    res.json({ success: true, message: "Added to cart", cart });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

// 📥 GET CART
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.user_id }).populate("items.product");

    if (!cart) {
      return res.json({ success: true, data: [] });
    }

    const formatted = cart.items.map((item) => ({
      _id: item._id,
      quantity: item.quantity,
      book: item.product // Sending populated product details as 'book' for frontend
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

// 🔄 UPDATE CART
export const updateCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    // 1. Validation
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return next(new HttpError("Invalid book ID format", 400));
    }

    // 2. Find the user's cart
    const cart = await Cart.findOne({ user: req.user.user_id });

    if (!cart) {
      return next(new HttpError("Cart not found for this user", 404));
    }

    // DEBUGGING: Uncomment the line below to see what's actually in your cart in the terminal
    // console.log("Searching for:", bookId, "Items in cart:", cart.items);

    // 3. Find item using .product (matches your Schema)
    // We use .toString() to ensure we are comparing strings to strings
    const item = cart.items.find(
      (i) => i.product && i.product.toString() === bookId.trim()
    );

    if (!item) {
      return next(
        new HttpError(
          "Item not found in cart. Make sure this book was added first.",
          404
        )
      );
    }

    // 4. Update and Save
    item.quantity = Number(quantity);
    await cart.save();

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

// ❌ REMOVE FROM CART
export const removeFromCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return next(new HttpError("Invalid book ID format", 400));
    }

    const cart = await Cart.findOne({ user: req.user.user_id });
    if (!cart) return next(new HttpError("Cart not found", 404));

    // ✅ FIX: Use item.product to match your Schema
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== bookId.trim()
    );

    if (cart.items.length === initialLength) {
      return next(new HttpError("Item was not in your cart", 404));
    }

    await cart.save();
    res.json({ success: true, message: "Item removed", cart });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

// 🗑️ CLEAR FULL CART USING CART ID
export const clearCartById = async (req, res, next) => {
  try {
    const { cartId } = req.params;

    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return next(new HttpError("Invalid cart ID format", 400));
    }

    // 2. Find cart
    const cart = await Cart.findById(cartId);

    if (!cart) {
      return next(new HttpError("Cart not found", 404));
    }

    // OPTIONAL: security check (recommended)
    if (cart.user.toString() !== req.user.user_id) {
      return next(new HttpError("Unauthorized access to cart", 403));
    }

    // 3. Clear all items
    cart.items = [];

    await cart.save();

    res.json({
      success: true,
      message: "All items removed from cart",
      cart,
    });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};