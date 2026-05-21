import { body } from "express-validator";

export const signupValidation = [
  body("firstName")
    .exists()
    .withMessage("firstName is required")
    .isString()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage("firstName must be a valid string"),

  body("lastName")
    .exists()
    .withMessage("lastName is required")
    .isString()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage("lastName must be a valid string"),

  body("email")
    .exists()
    .withMessage("email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("email must be valid"),

  body("password")
    .exists()
    .withMessage("password is required")
    .isString()
    .trim()
    .isLength({ min: 6, max: 200 })
    .withMessage("password must be between 6 and 200 characters"),
];

export const loginValidation = [
  body("email")
    .exists()
    .withMessage("email is required")
    .isEmail()
    .normalizeEmail(),

  body("password")
    .exists()
    .withMessage("password is required")
    .isString()
    .trim()
    .notEmpty(),
];

export const forgotPasswordValidation = [
  body("email")
    .exists()
    .withMessage("email is required")
    .isEmail()
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body("email")
    .exists()
    .withMessage("email is required")
    .isEmail()
    .normalizeEmail(),

  body("password")
    .exists()
    .withMessage("password is required")
    .isString()
    .trim()
    .isLength({ min: 6, max: 200 }),
];

