import express from "express";
import authCheck from "../middleware/authCheck.js";
import upload from "../middleware/upload.js";
import roleCheck from "../middleware/rolecheck.js";

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
router.post("/",authCheck,roleCheck("seller", "admin"),upload.single("image"),addBook);
router.patch("/updateBook/:id", authCheck, roleCheck("seller", "admin"), upload.single("image"), updateBook);
router.delete("/deleteBook/:id", authCheck, roleCheck("seller", "admin"), deleteBook);

router.post("/", authCheck, roleCheck("seller", "admin"), upload.single("image"), addBook);
router.put("/:id", authCheck, roleCheck("seller", "admin"), upload.single("image"), updateBook);
router.delete("/:id", authCheck, roleCheck("seller", "admin"), deleteBook);

export default router;
