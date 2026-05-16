import HttpError from "../utils/HttpError.js";

const roleCheck = (...roles) => {
  return (req, res, next) => {
    try {
      // check user exists
      if (!req.user) {
        return next(
          new HttpError(
            "Unauthorized access",
            401
          )
        );
      }

      // check role
      if (!roles.includes(req.user.role)) {
        return next(
          new HttpError(
            "Access denied",
            403
          )
        );
      }

      next();
    } catch (err) {
      return next(
        new HttpError(
          err.message,
          500
        )
      );
    }
  };
};

export default roleCheck;