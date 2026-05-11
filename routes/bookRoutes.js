import express from "express";
import authCheck from "../middleware/authCheck.js";
import upload from "../middleware/upload.js";

import {
  addBook,
  getSingleBook,
  listBooks,
  updateBook,
  deleteBook
} from "../controllers/bookController.js";

const router = express.Router();

// ✅ PUBLIC
router.get("/listBooks", listBooks);
router.get("/getBook/:id", getSingleBook);

// ✅ REST aliases (frontend compatibility)
router.get("/", listBooks);
router.get("/:id", getSingleBook);

// 🔐 PROTECTED
router.post("/addBook", authCheck, upload.single("image"), addBook);
router.patch("/updateBook/:id", authCheck, upload.single("image"), updateBook);
router.delete("/deleteBook/:id", authCheck, deleteBook);

router.post("/", authCheck, upload.single("image"), addBook);
router.put("/:id", authCheck, upload.single("image"), updateBook);
router.delete("/:id", authCheck, deleteBook);

export default router;
