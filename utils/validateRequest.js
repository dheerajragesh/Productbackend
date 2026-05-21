import { validationResult } from "express-validator";

import HttpError from "./httpError.js";

export default function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Keep it close to the pattern you shared
    return next(new HttpError("Invalid User Input", 400));
  }

  return next();
}

