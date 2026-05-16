import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/connectDB.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

// ✅ ADMIN ROUTE
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

// ================= STATIC FOLDER =================
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);

app.use("/api/books", bookRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/wishlist", wishlistRoutes);

// ✅ ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("API Running...");
});

// ================= ERROR MIDDLEWARE =================
app.use((err, req, res, next) => {
  console.log("ERROR 👉", err);

  res.status(err.code || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});