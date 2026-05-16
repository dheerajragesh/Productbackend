import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} from "../controllers/wishlistController.js";
import roleCheck from "../middleware/rolecheck.js";
import authCheck from "../middleware/authCheck.js";
const router = express.Router();

router.post("/addwishlist/:productId", authCheck, roleCheck("user"), addToWishlist);
router.get("/getwishlist", authCheck, roleCheck("user"), getWishlist);
router.delete("/removewishlist/:productId", authCheck, removeFromWishlist);

export default router;