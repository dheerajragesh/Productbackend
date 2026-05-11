import express from "express";
import dotenv from "dotenv";

import { connectDB } from "./config/connectDB.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cors from "cors";

dotenv.config(); // ✅ MUST be at top

const app = express();

// ✅ Middleware
app.use(cors()); // ✅ Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded images
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/auth", authRoutes);       //  signup & login
app.use("/api/books", bookRoutes);      //  books
app.use("/api/cart", cartRoutes);       //  cart
app.use("/api/wishlist", wishlistRoutes); //  wishlist
app.use("/api/orders", orderRoutes);    //  orders

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("ERROR 👉", err);

  res.status(err.code || err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ✅ Connect DB
connectDB();

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
