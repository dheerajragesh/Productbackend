import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCartById,
} from "../controllers/cartController.js";
import roleCheck from "../middleware/rolecheck.js";
import authCheck from "../middleware/authCheck.js";

import { validationMiddleware } from "../utils/validateRequestMiddleware.js";
import {
  addToCartValidation,
  updateCartValidation,
  removeFromCartValidation,
  cartCartIdParam,
} from "../validations/cartValidations.js";

const router = express.Router();

router.post(
  "/add",
  authCheck,
  roleCheck("user"),
  addToCartValidation,
  validationMiddleware,
  addToCart
);
router.get("/get", authCheck, roleCheck("user"), getCart);

router.put(
  "/update/:bookId",
  authCheck,
  roleCheck("user"),
  updateCartValidation,
  validationMiddleware,
  updateCart
);

router.delete(
  "/remove/:bookId",
  authCheck,
  roleCheck("user"),
  removeFromCartValidation,
  validationMiddleware,
  removeFromCart
);

router.delete(
  "/clear/:cartId",
  authCheck,
  roleCheck("user"),
  cartCartIdParam,
  validationMiddleware,
  clearCartById
);

export default router;
