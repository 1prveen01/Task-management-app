import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import dotenv from "dotenv";
import { ApiError } from "../utils/apiError.js";

dotenv.config();

export const verifyJWT = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Get user from DB
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized Request");
    }

    // Attach user (including their true role)
    req.user = user;

    next();
  } catch (error) {
    return next(new ApiError(401, error?.message || "Invalid access Token"));
  }
};
