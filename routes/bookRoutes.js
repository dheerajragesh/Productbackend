import express from "express";
import authCheck from "../middleware/authCheck.js";
import upload from "../middleware/upload.js";
import roleCheck from "../middleware/rolecheck.js";

import {
  addBook,
  getSingleBook,
  listBooks,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

import { validationMiddleware } from "../utils/validateRequestMiddleware.js";
import {
  addBookValidation,
  updateBookValidation,
  objectIdParam,
} from "../validations/bookValidations.js";

const router = express.Router();

// ✅ PUBLIC
router.get("/listBooks", listBooks);
router.get("/getBook/:id", getSingleBook);

// ✅ REST aliases (frontend compatibility)
router.get("/", listBooks);
router.get("/:id", getSingleBook);

// 🔐 PROTECTED
router.post(
  "/",
  authCheck,
  roleCheck("seller", "admin"),
  upload.single("image"),
  addBookValidation,
  validationMiddleware,
  addBook
);

router.patch(
  "/updateBook/:id",
  authCheck,
  roleCheck("seller", "admin"),
  upload.single("image"),
  updateBookValidation,
  validationMiddleware,
  updateBook
);

router.delete(
  "/deleteBook/:id",
  authCheck,
  roleCheck("seller", "admin"),
  objectIdParam("id"),
  validationMiddleware,
  deleteBook
);

// aliases
router.put(
  "/:id",
  authCheck,
  roleCheck("seller", "admin"),
  upload.single("image"),
  updateBookValidation,
  validationMiddleware,
  updateBook
);

router.delete(
  "/:id",
  authCheck,
  roleCheck("seller", "admin"),
  objectIdParam("id"),
  validationMiddleware,
  deleteBook
);

export default router;
