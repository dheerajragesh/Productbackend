import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import roleCheck from "../middleware/rolecheck.js";
import authCheck from "../middleware/authCheck.js";

import { validationMiddleware } from "../utils/validateRequestMiddleware.js";
import { wishlistProductIdValidation } from "../validations/wishlistValidations.js";

const router = express.Router();

router.post(
  "/addwishlist/:productId",
  authCheck,
  roleCheck("user"),
  wishlistProductIdValidation,
  validationMiddleware,
  addToWishlist
);
router.get("/getwishlist", authCheck, roleCheck("user"), getWishlist);

router.delete(
  "/removewishlist/:productId",
  authCheck,
  roleCheck("user"),
  wishlistProductIdValidation,
  validationMiddleware,
  removeFromWishlist
);

export default router;
