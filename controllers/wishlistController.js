import { Wishlist } from "../models/wishlist.js";
import HttpError from "../utils/httpError.js";


// ➕ ADD TO WISHLIST
export const addToWishlist = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return next(new HttpError("Not authorized", 403));
    }

    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user.user_id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.user_id,
        products: [],
      });
    }

    // avoid duplicates
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.json({
      success: true,
      message: "Added to wishlist",
      data: wishlist,
    });

  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

// 📥 GET WISHLIST (🔥 WITH IMAGE)
export const getWishlist = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return next(new HttpError("Not authorized", 403));
    }

    const wishlist = await Wishlist.findOne({
      user: req.user.user_id,
    }).populate("products");

    if (!wishlist) {
      return res.json({ success: true, data: [] });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const data = wishlist.products.map(item => ({
      ...item._doc,
      image: item.image ? `${baseUrl}/${item.image}` : null,
    }));

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};


// ❌ REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return next(new HttpError("Not authorized", 403));
    }

    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user.user_id,
    });

    if (!wishlist) {
      return next(new HttpError("Wishlist not found", 404));
    }

    wishlist.products = wishlist.products.filter(
      item => item.toString() !== productId
    );

    await wishlist.save();

    res.json({
      success: true,
      message: "Removed from wishlist",
      data: wishlist.products,
    });

  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};