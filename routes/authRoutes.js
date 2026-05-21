import express from "express";
import multer from "multer";
import { userLogin, userRegister, forgotPassword, resetPassword } from "../controllers/authController.js";

import { validationMiddleware } from "../utils/validateRequestMiddleware.js";
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validations/authValidations.js";

const authroutes = express.Router();

const upload = multer();

authroutes.post(
  "/signup",
  upload.none(),
  signupValidation,
  validationMiddleware,
  userRegister
);

authroutes.post(
  "/login",
  upload.none(),
  loginValidation,
  validationMiddleware,
  userLogin
);

authroutes.post(
  "/forgot-password",
  upload.none(),
  forgotPasswordValidation,
  validationMiddleware,
  forgotPassword
);

authroutes.post(
  "/reset-password",
  upload.none(),
  resetPasswordValidation,
  validationMiddleware,
  resetPassword
);

export default authroutes;
