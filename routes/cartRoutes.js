import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCartById
} from "../controllers/cartController.js";
import authCheck from "../middleware/authCheck.js";
const router = express.Router();

router.post("/add", authCheck, addToCart);
router.get("/get", authCheck, getCart);
router.put("/update/:bookId", authCheck, updateCart);
router.delete("/remove/:bookId", authCheck, removeFromCart);
router.delete("/clear/:cartId", authCheck, clearCartById);
export default router;