import express from "express";
import multer from "multer";
import { userLogin, userRegister,forgotPassword,resetPassword } from "../controllers/authController.js";

const authroutes = express.Router();

const upload = multer();// Configure multer to save uploaded files to the "uploads" directory

authroutes.post("/signup", upload.none(), userRegister); 
authroutes.post("/login", upload.none(), userLogin); 
authroutes.post("/forgot-password", upload.none(), forgotPassword);
authroutes.post("/reset-password", upload.none(), resetPassword);    

export default authroutes;