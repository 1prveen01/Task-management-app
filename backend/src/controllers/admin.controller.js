import { User } from "../models/users.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, users, "All users fetched successfully"));
});
// Delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent admin from deleting themseleve
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own admin account");
  }

  // Prevent deleting the ONLY admin
  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot delete the only admin user");
    }
  }

  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});


export { getAllUsers, deleteUser };
