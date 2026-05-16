import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCartById
} from "../controllers/cartController.js";
import roleCheck from "../middleware/rolecheck.js";
import authCheck from "../middleware/authCheck.js";
const router = express.Router();

router.post("/add", authCheck, roleCheck("user"), addToCart);
router.get("/get", authCheck, roleCheck("user"), getCart);
router.put("/update/:bookId", authCheck, roleCheck("user"), updateCart);
router.delete("/remove/:bookId", authCheck, roleCheck("user"), removeFromCart);
router.delete("/clear/:cartId", authCheck, roleCheck("user"), clearCartById);
export default router;