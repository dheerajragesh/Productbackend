import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "Unknown",
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: null,
    },

    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Book =
  mongoose.models.Book ||
  mongoose.model("Book", bookSchema);