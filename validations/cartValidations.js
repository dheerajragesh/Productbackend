import { body, param } from "express-validator";

export const cartBookIdParam = [
  param("bookId")
    .exists()
    .withMessage("bookId is required")
    .isMongoId()
    .withMessage("Invalid bookId"),
];

export const cartCartIdParam = [
  param("cartId")
    .exists()
    .withMessage("cartId is required")
    .isMongoId()
    .withMessage("Invalid cartId"),
];

export const addToCartValidation = [
  body("product")
    .optional({ nullable: true })
    .isString()
    .trim(),

  body("productId")
    .optional({ nullable: true })
    .isString()
    .trim(),

  body("quantity")
    .optional({ nullable: true })
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("quantity must be a number");
      if (n < 1) throw new Error("quantity must be at least 1");
      return true;
    }),
];

export const updateCartValidation = [
  ...cartBookIdParam,
  body("quantity")
    .exists()
    .withMessage("quantity is required")
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("quantity must be a number");
      if (n < 1) throw new Error("quantity must be at least 1");
      return true;
    }),
];

export const removeFromCartValidation = cartBookIdParam;

