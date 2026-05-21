import { param } from "express-validator";

export const wishlistProductIdValidation = [
  param("productId")
    .exists()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId"),
];

