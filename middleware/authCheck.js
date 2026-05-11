import HttpError from "../utils/HttpError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

const authCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header
    if (!authHeader) {
      return next(new HttpError("No authorization header", 401));
    }

    if (!authHeader.startsWith("Bearer ")) {
      return next(new HttpError("Invalid token format", 401));
    }

    const token = authHeader.split(" ")[1].trim(); // ✅ important trim

    if (!token) {
      return next(new HttpError("Token missing", 401));
    }

    // 2. Verify token safely
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("JWT VERIFY ERROR:", err.message);
      return next(new HttpError("Invalid or expired token", 401));
    }

    // 3. Check user
    const user = await User.findById(decodedToken.user_id);

    if (!user) {
      return next(new HttpError("User not found", 401));
    }

    // 4. Attach user
    req.user = {
      user_id: decodedToken.user_id,
      role: decodedToken.role,
    };

    next();
  } catch (err) {
    console.log("AUTH MIDDLEWARE ERROR:", err);
    return next(new HttpError("Authentication failed", 401));
  }
};

export default authCheck;