import { User } from "../models/user.js";
import { Book } from "../models/Book.js";
import HttpError from "../utils/httpError.js";

// ================= GET ALL USERS =================
export const getAllUsers = async (
  req,
  res,
  next
) => {
  try {
    // ADMIN CHECK
    if (req.user.role !== "admin") {
      return next(
        new HttpError("Admin access only", 403)
      );
    }

    const users = await User.find().select(
      "-password"
    );

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= DELETE USER =================
export const deleteUser = async (
  req,
  res,
  next
) => {
  try {
    if (req.user.role !== "admin") {
      return next(
        new HttpError("Admin access only", 403)
      );
    }

    const user = await User.findByIdAndDelete(
      req.params.id
    );

    if (!user) {
      return next(
        new HttpError("User not found", 404)
      );
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= DELETE BOOK =================
export const deleteBookByAdmin = async (
  req,
  res,
  next
) => {
  try {
    if (req.user.role !== "admin") {
      return next(
        new HttpError("Admin access only", 403)
      );
    }

    const book = await Book.findByIdAndDelete(
      req.params.id
    );

    if (!book) {
      return next(
        new HttpError("Book not found", 404)
      );
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};