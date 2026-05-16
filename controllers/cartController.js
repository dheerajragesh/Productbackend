import { Cart } from "../models/cart.js";
import { Book } from "../models/book.js";
import HttpError from "../utils/httpError.js";
import mongoose from "mongoose";

// ======================================
// ✅ ADD TO CART
// ======================================
export const addToCart = async (
  req,
  res,
  next
) => {
  try {
    const {
      product,
      productId,
      quantity = 1,
    } = req.body;

    // ✅ supports both product & productId
    const bookId = (
      product ||
      productId ||
      ""
    ).trim();

    // ✅ validate id
    if (
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      return next(
        new HttpError(
          "Invalid book ID",
          400
        )
      );
    }

    // ✅ check book exists
    const book = await Book.findById(
      bookId
    );

    if (!book || book.is_deleted) {
      return next(
        new HttpError(
          "Book not found",
          404
        )
      );
    }

    // ✅ seller cannot add own book
    if (
      book.user_id?.toString() ===
      req.user.user_id
    ) {
      return next(
        new HttpError(
          "You cannot buy your own book",
          403
        )
      );
    }

    // ✅ find cart
    let cart = await Cart.findOne({
      user: req.user.user_id,
    });

    // ✅ create cart
    if (!cart) {
      cart = new Cart({
        user: req.user.user_id,
        items: [],
      });
    }

    // ✅ check existing item
    const existingIndex =
      cart.items.findIndex(
        (item) =>
          item.product.toString() ===
          bookId
      );

    // ✅ update quantity
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity +=
        Number(quantity);
    } else {
      // ✅ add item
      cart.items.push({
        product: bookId,
        quantity: Number(quantity),
      });
    }

    // ✅ save
    await cart.save();

    // ✅ populate
    await cart.populate(
      "items.product"
    );

    return res.status(200).json({
      success: true,
      message:
        "Added to cart successfully",
      cart,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message ||
          "Failed to add cart",
        500
      )
    );
  }
};

// ======================================
// ✅ GET CART
// ======================================
export const getCart = async (
  req,
  res,
  next
) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.user_id,
    }).populate("items.product");

    // ✅ empty cart
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // ✅ format response
    const formatted =
      cart.items.map((item) => ({
        _id: item._id,
        quantity: item.quantity,
        book: item.product,
      }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message ||
          "Failed to fetch cart",
        500
      )
    );
  }
};

// ======================================
// ✅ UPDATE CART
// ======================================
export const updateCart = async (
  req,
  res,
  next
) => {
  try {
    const { bookId } = req.params;

    const { quantity } = req.body;

    // ✅ validate id
    if (
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      return next(
        new HttpError(
          "Invalid book ID",
          400
        )
      );
    }

    // ✅ validate quantity
    if (
      !quantity ||
      Number(quantity) < 1
    ) {
      return next(
        new HttpError(
          "Quantity must be at least 1",
          400
        )
      );
    }

    // ✅ find cart
    const cart = await Cart.findOne({
      user: req.user.user_id,
    });

    if (!cart) {
      return next(
        new HttpError(
          "Cart not found",
          404
        )
      );
    }

    // ✅ find item
    const item = cart.items.find(
      (i) =>
        i.product.toString() ===
        bookId.trim()
    );

    if (!item) {
      return next(
        new HttpError(
          "Item not found in cart",
          404
        )
      );
    }

    // ✅ update quantity
    item.quantity = Number(quantity);

    await cart.save();

    await cart.populate(
      "items.product"
    );

    return res.status(200).json({
      success: true,
      message:
        "Cart updated successfully",
      cart,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message ||
          "Failed to update cart",
        500
      )
    );
  }
};

// ======================================
// ✅ REMOVE FROM CART
// ======================================
export const removeFromCart = async (
  req,
  res,
  next
) => {
  try {
    const { bookId } = req.params;

    // ✅ validate id
    if (
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      return next(
        new HttpError(
          "Invalid book ID",
          400
        )
      );
    }

    // ✅ find cart
    const cart = await Cart.findOne({
      user: req.user.user_id,
    });

    if (!cart) {
      return next(
        new HttpError(
          "Cart not found",
          404
        )
      );
    }

    // ✅ remove item
    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !==
        bookId.trim()
    );

    await cart.save();

    await cart.populate(
      "items.product"
    );

    return res.status(200).json({
      success: true,
      message:
        "Item removed from cart",
      cart,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message ||
          "Failed to remove item",
        500
      )
    );
  }
};

// ======================================
// ✅ CLEAR CART
// ======================================
export const clearCartById = async (
  req,
  res,
  next
) => {
  try {
    const { cartId } = req.params;

    // ✅ validate cart id
    if (
      !mongoose.Types.ObjectId.isValid(
        cartId
      )
    ) {
      return next(
        new HttpError(
          "Invalid cart ID",
          400
        )
      );
    }

    // ✅ find cart
    const cart = await Cart.findById(
      cartId
    );

    if (!cart) {
      return next(
        new HttpError(
          "Cart not found",
          404
        )
      );
    }

    // ✅ ownership check
    if (
      cart.user.toString() !==
      req.user.user_id
    ) {
      return next(
        new HttpError(
          "Unauthorized access",
          403
        )
      );
    }

    // ✅ clear items
    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message:
        "Cart cleared successfully",
      cart,
    });
  } catch (err) {
    console.log(err);

    return next(
      new HttpError(
        err.message ||
          "Failed to clear cart",
        500
      )
    );
  }
};