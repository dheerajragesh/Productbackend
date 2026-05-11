import HttpError from "../utils/httpError.js";
import { Book } from "../models/book.js";
import mongoose from "mongoose";
import fs from "fs";


// ==============================
// ✅ ADD BOOK
// ==============================
export const addBook = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return next(new HttpError("Not authorized", 403));
    }

    const {
      title,
      name,
      description,
      details,
      excerpt,
      price,
      page_count,
    } = req.body;

    const normalizedTitle = (title || name || "").trim();
    const normalizedDescription = (description || details || "").trim();

    const normalizedPrice =
      price !== undefined && price !== null && `${price}`.trim() !== ""
        ? Number(price)
        : null;

    if (
      !normalizedTitle ||
      !normalizedDescription ||
      normalizedPrice === null ||
      Number.isNaN(normalizedPrice)
    ) {
      return next(new HttpError("Missing required fields", 400));
    }

    const newBook = new Book({
      title: normalizedTitle,
      description: normalizedDescription,
      excerpt,
      price: normalizedPrice,
      page_count:
        page_count !== undefined &&
        page_count !== null &&
        `${page_count}`.trim() !== ""
          ? Number(page_count)
          : undefined,
      user_id: req.user.user_id,
      image: req.file ? `uploads/${req.file.filename}` : null,
    });

    await newBook.save();

    return res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: newBook,
    });
  } catch (error) {
    return next(new HttpError(error.message || "Internal Server Error", 500));
  }
};


// ==============================
// ✅ GET SINGLE BOOK
// ==============================
export const getSingleBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Invalid Book ID", 400));
    }

    const book = await Book.findById(id);

    if (!book || book.is_deleted) {
      return next(new HttpError("Book Not Found", 404));
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};


// ==============================
// ✅ LIST BOOKS (🔥 PAGINATION)
// ==============================
export const listBooks = async (req, res, next) => {
  try {
    // 📌 Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const skip = (page - 1) * limit;

    // 📌 Fetch paginated books
    const books = await Book.find({ is_deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 📌 Total count
    const total = await Book.countDocuments({
      is_deleted: { $ne: true },
    });

    return res.status(200).json({
      success: true,
      data: books,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};


// ==============================
// ✅ UPDATE BOOK
// ==============================
export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Invalid Book ID", 400));
    }

    if (!req.user || req.user.role !== "seller") {
      return next(new HttpError("Not authorized", 403));
    }

    const book = await Book.findById(id);

    if (!book) {
      return next(new HttpError("Book not found", 404));
    }

    if (book.user_id.toString() !== req.user.user_id) {
      return next(
        new HttpError("You can only update your own books", 403)
      );
    }

    const updatedData = { ...req.body };

    // ✅ Compatibility
    if (!updatedData.title && updatedData.name)
      updatedData.title = updatedData.name;

    if (!updatedData.description && updatedData.details)
      updatedData.description = updatedData.details;

    // ✅ Convert types
    if (updatedData.price) {
      updatedData.price = Number(updatedData.price);
    }

    if (updatedData.page_count) {
      updatedData.page_count = Number(updatedData.page_count);
    }

    if (updatedData.publish_date) {
      updatedData.publish_date = new Date(updatedData.publish_date);
    }

    // ✅ Handle image update
    if (req.file) {
      if (book.image && fs.existsSync(book.image)) {
        fs.unlinkSync(book.image);
      }
      updatedData.image = `uploads/${req.file.filename}`;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedBook,
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};


// ==============================
// ✅ DELETE BOOK (SOFT DELETE)
// ==============================
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Invalid Book ID", 400));
    }

    if (!req.user || req.user.role !== "seller") {
      return next(new HttpError("Not authorized", 403));
    }

    const book = await Book.findById(id);

    if (!book) {
      return next(new HttpError("Book not found", 404));
    }

    if (book.user_id.toString() !== req.user.user_id) {
      return next(
        new HttpError("You can only delete your own books", 403)
      );
    }

    // ✅ delete image
    if (book.image && fs.existsSync(book.image)) {
      fs.unlinkSync(book.image);
    }

    book.is_deleted = true;
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};