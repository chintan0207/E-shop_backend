import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export const isAdmin = asyncHandler(async (req, _, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json(new ApiError(403, "Admin access is required"));
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(
      403,
      error.message || "Error occurred in Admin middlewar"
    );
  }
});
