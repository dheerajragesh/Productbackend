import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.js";
import HttpError from "../utils/httpError.js";
import { sendWelcomeEmail } from "../config/mail/nodemailer.js";
import emailTemplates from "../config/mail/emailTemplates.js";

// ================= REGISTER =================
export const userRegister = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return next(new HttpError("All fields are required", 400));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new HttpError("Email already exists", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();
    
     const welcomeLink = "https://tailwindcss.com/";
        const subject = 'Successfully  registered ';
        const template = emailTemplates.welcome_mail
        const user_name = newUser.firstName
        const to = newUser.email
        const context = {
          received_by: user_name,
          check: welcomeLink
        }

        await sendWelcomeEmail(to, subject, template, context)

    const token = jwt.sign(
      {
        user_id: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TOKEN_EXPIRY }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
      accessToken: token,
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};

// ================= LOGIN =================
export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError("Email and password are required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new HttpError("Invalid email or password", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new HttpError("Invalid email or password", 401));
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TOKEN_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      accessToken: token,
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
};
// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new HttpError("Email is required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new HttpError("Email not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Email verified",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new HttpError("Email and password are required", 400)
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    // ✅ hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};