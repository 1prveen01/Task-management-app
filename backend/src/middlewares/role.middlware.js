

import dotenv from "dotenv";
import { ApiError } from "../utils/apiError.js";

dotenv.config();

export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
       return new ApiError(403 ,  error?.message || "Access Denied")
    }
    next();
  };
};
