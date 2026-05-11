import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} from "../controllers/wishlistController.js";
import authCheck from "../middleware/authCheck.js";
const router = express.Router();

router.post("/addwishlist/:productId", authCheck, addToWishlist);
router.get("/getwishlist", authCheck, getWishlist);
router.delete("/removewishlist/:productId", authCheck, removeFromWishlist);

export default router;