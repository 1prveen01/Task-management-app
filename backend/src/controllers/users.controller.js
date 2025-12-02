import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary , cloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { getPublicIdFromUrl } from "../utils/getPublicIdFromUrl.js";

//refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
 
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Refresh and Access token"
    );
  }
};

// register user
const registerUser = asyncHandler(async (req, res) => {

   const isFirstUser = (await User.countDocuments({})) === 0;

  const { fullName, email, password } = req.body;

  if ([email, password, fullName].some(f => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if email already exists BEFORE doing anything else
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User email already exists");
  }

  // Optional avatar
  let avatarUrl = null;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    avatarUrl = avatar?.url;
  }

  try {
    const user = await User.create({
      fullName,
      avatar: avatarUrl,
      email,
      password,
      role: isFirstUser ? "admin" : "user",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Generate Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          {
            user: createdUser,
            accessToken,
            refreshToken,
          },
          "User Registered & Logged In Successfully"
        )
      );
  } catch (err) {
    // catch duplicate key error
    if (err.code === 11000 && err.keyValue?.email) {
      throw new ApiError(409, "User email already exists");
    }
    throw err;
  }
});


// login user

//req body from data
//username or email
//find the user
//password check
//access and refresh token
//cookies

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check email & password
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user by email ONLY
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Cookie options
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

//refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none", // allow cross-origin (Vercel <-> Render)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});


//change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  if (!(newPassword === confPassword)) {
    throw new ApiError(400, "new Pass and cnf Pass does not match");
  }
  const user = await User.findById(req.user?._id);

  //check if old is password is correct or not
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "old Password is incorrect");
  }

  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
});


//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});


//update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;

  if (!email || !fullName) {
    throw new ApiError(400, "All feilds are required");
  }

  
const exists = await User.findOne({ email, _id: { $ne: req.user._id }});
if (exists) throw new ApiError(409, "Email already in use by another account");

  const userUpdated = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, userUpdated, "Accounts details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "missing avatar local file path");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const existingUser = await User.findById(req.user?._id);
  const oldAvatarPublicId = getPublicIdFromUrl(existingUser.avatar);

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  if (oldAvatarPublicId) {
    await cloudinary.uploader.destroy(oldAvatarPublicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

//delete user
const deleteUserAccount = asyncHandler(async (req, res) => {
  try {
    console.log("User in request:", req.user);

    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in request" });
    }
    // Delete the user
    await User.findByIdAndDelete(userId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "User deleted successfully"
        )
      );
  } catch (error) {
    console.error("Error deleting user account:", error);
    return res.status(500).json({ error: "Failed to delete user account" });
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  deleteUserAccount,
};
