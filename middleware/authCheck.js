import HttpError from "../utils/httpError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

const authCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ================= CHECK HEADER =================
    if (!authHeader) {
      return next(
        new HttpError(
          "No authorization header",
          401
        )
      );
    }

    // ================= CHECK FORMAT =================
    if (!authHeader.startsWith("Bearer ")) {
      return next(
        new HttpError(
          "Invalid token format",
          401
        )
      );
    }

    // ================= GET TOKEN =================
    const token = authHeader
      .split(" ")[1]
      .trim();

    if (!token) {
      return next(
        new HttpError(
          "Token missing",
          401
        )
      );
    }

    // ================= VERIFY TOKEN =================
    let decodedToken;

    try {
      decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (err) {
      console.log(
        "JWT VERIFY ERROR:",
        err.message
      );

      return next(
        new HttpError(
          "Invalid or expired token",
          401
        )
      );
    }

    // ================= FIND USER =================
    const user = await User.findById(
      decodedToken.user_id
    );

    if (!user) {
      return next(
        new HttpError(
          "User not found",
          401
        )
      );
    }

    // ================= ATTACH USER =================
    req.user = {
      user_id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (err) {
    console.log(
      "AUTH MIDDLEWARE ERROR:",
      err
    );

    return next(
      new HttpError(
        "Authentication failed",
        401
      )
    );
  }
};

export default authCheck;