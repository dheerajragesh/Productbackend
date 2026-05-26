import express from "express";
import authCheck from "../middleware/authCheck.js";

import {
  getAllUsers,
  deleteUser,
  deleteBookByAdmin,
} from "../controllers/adminController.js";

const adminroutes = express.Router();

// GET ALL USERS
adminroutes.get("/users", authCheck, getAllUsers);

// DELETE USER
adminroutes.delete("/user/:id", authCheck, deleteUser);

// DELETE BOOK
adminroutes.delete("/book/:id", authCheck, deleteBookByAdmin);


export default adminroutes;