import HttpError from "../utils/httpError.js";
import { Book } from "../models/Book.js";
import mongoose from "mongoose";
import fs from "fs";

// ======================================
// ✅ ADD BOOK
// ======================================
export const addBook = async (req, res, next) => {
  try {
    // ✅ only seller/admin
    if (
      !req.user ||
      (req.user.role !== "seller" &&
        req.user.role !== "admin")
    ) {
      return next(
        new HttpError("Not authorized", 403)
      );
    }

    const {
      title,
      name,
      description,
      details,
      excerpt,
      price,
      page_count,
      category,
      stock,
      author,
    } = req.body;

    const normalizedTitle = (
      title ||
      name ||
      ""
    ).trim();

    const normalizedDescription = (
      description ||
      details ||
      ""
    ).trim();

    const normalizedPrice =
      price !== undefined &&
      price !== null &&
      `${price}`.trim() !== ""
        ? Number(price)
        : null;

    if (
      !normalizedTitle ||
      !normalizedDescription ||
      normalizedPrice === null ||
      Number.isNaN(normalizedPrice)
    ) {
      return next(
        new HttpError(
          "Missing required fields",
          400
        )
      );
    }

    const newBook = new Book({
      title: normalizedTitle,
      description: normalizedDescription,
      excerpt,
      author,
      price: normalizedPrice,

      page_count:
        page_count !== undefined &&
        page_count !== null &&
        `${page_count}`.trim() !== ""
          ? Number(page_count)
          : undefined,

      category,

      stock:
        stock !== undefined
          ? Number(stock)
          : 0,

      // ✅ FIXED
      seller_id: req.user.user_id,

      image: req.file
        ? `uploads/${req.file.filename}`
        : null,
    });

    await newBook.save();

    return res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: newBook,
    });
  } catch (error) {
    return next(
      new HttpError(
        error.message ||
          "Internal Server Error",
        500
      )
    );
  }
};

// ======================================
// ✅ GET SINGLE BOOK
// ======================================
export const getSingleBook = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        new HttpError(
          "Invalid Book ID",
          400
        )
      );
    }

    const book = await Book.findById(id)
      // ✅ FIXED
      .populate(
        "seller_id",
        "firstName lastName email role"
      );

    if (!book || book.is_deleted) {
      return next(
        new HttpError(
          "Book Not Found",
          404
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    return next(
      new HttpError(error.message, 500)
    );
  }
};

// ======================================
// ✅ LIST BOOKS
// ======================================
export const listBooks = async (
  req,
  res,
  next
) => {
  try {
    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 8;

    const skip = (page - 1) * limit;

    const search =
      req.query.search || "";

    const category =
      req.query.category || "";

    const minPrice =
      req.query.minPrice || 0;

    const maxPrice =
      req.query.maxPrice || 999999;

    const query = {
      is_deleted: false,

      title: {
        $regex: search,
        $options: "i",
      },

      price: {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      },
    };

    if (category) {
      query.category = category;
    }

    const books = await Book.find(query)
      // ✅ FIXED
      .populate(
        "seller_id",
        "firstName lastName email"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total =
      await Book.countDocuments(query);

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
    return next(
      new HttpError(error.message, 500)
    );
  }
};

// ======================================
// ✅ SELLER BOOKS
// ======================================
export const sellerBooks = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user ||
      (req.user.role !== "seller" &&
        req.user.role !== "admin")
    ) {
      return next(
        new HttpError("Not authorized", 403)
      );
    }

    const books = await Book.find({
      // ✅ FIXED
      seller_id: req.user.user_id,
      is_deleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    return next(
      new HttpError(error.message, 500)
    );
  }
};

// ======================================
// ✅ UPDATE BOOK
// ======================================
export const updateBook = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        new HttpError(
          "Invalid Book ID",
          400
        )
      );
    }

    if (
      !req.user ||
      (req.user.role !== "seller" &&
        req.user.role !== "admin")
    ) {
      return next(
        new HttpError("Not authorized", 403)
      );
    }

    const book = await Book.findById(id);

    if (!book) {
      return next(
        new HttpError(
          "Book not found",
          404
        )
      );
    }

    // ✅ FIXED
    if (
      req.user.role !== "admin" &&
      book.seller_id.toString() !==
        req.user.user_id
    ) {
      return next(
        new HttpError(
          "You can only update your own books",
          403
        )
      );
    }

    const updatedData = {
      ...req.body,
    };

    if (
      !updatedData.title &&
      updatedData.name
    ) {
      updatedData.title =
        updatedData.name;
    }

    if (
      !updatedData.description &&
      updatedData.details
    ) {
      updatedData.description =
        updatedData.details;
    }

    if (updatedData.price) {
      updatedData.price = Number(
        updatedData.price
      );
    }

    if (updatedData.page_count) {
      updatedData.page_count =
        Number(updatedData.page_count);
    }

    if (updatedData.stock) {
      updatedData.stock = Number(
        updatedData.stock
      );
    }

    if (req.file) {
      if (
        book.image &&
        fs.existsSync(book.image)
      ) {
        fs.unlinkSync(book.image);
      }

      updatedData.image = `uploads/${req.file.filename}`;
    }

    const updatedBook =
      await Book.findByIdAndUpdate(
        id,
        {
          $set: updatedData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    return next(
      new HttpError(error.message, 500)
    );
  }
};

// ======================================
// ✅ DELETE BOOK
// ======================================
export const deleteBook = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return next(
        new HttpError(
          "Invalid Book ID",
          400
        )
      );
    }

    if (
      !req.user ||
      (req.user.role !== "seller" &&
        req.user.role !== "admin")
    ) {
      return next(
        new HttpError("Not authorized", 403)
      );
    }

    const book = await Book.findById(id);

    if (!book) {
      return next(
        new HttpError(
          "Book not found",
          404
        )
      );
    }

    // ✅ FIXED
    if (
      req.user.role !== "admin" &&
      book.seller_id.toString() !==
        req.user.user_id
    ) {
      return next(
        new HttpError(
          "You can only delete your own books",
          403
        )
      );
    }

    if (
      book.image &&
      fs.existsSync(book.image)
    ) {
      fs.unlinkSync(book.image);
    }

    book.is_deleted = true;

    await book.save();

    return res.status(200).json({
      success: true,
      message:
        "Book deleted successfully",
    });
  } catch (error) {
    return next(
      new HttpError(error.message, 500)
    );
  }
};