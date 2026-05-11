import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    page_count: {
      type: Number,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
        image: {
      type: String,
      default: null, // ✅ image path
    },
   
  },
  { timestamps: true, bufferCommands: false }
);

export const Book = mongoose.model("Book", bookSchema);
