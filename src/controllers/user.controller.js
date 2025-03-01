import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import { generatePassword } from "../utils/generatePassword.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    console.log(username);

    if (
      [username, email, phone].some((field) => !field || field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      return res
        .status(409)
        .json(new ApiError(409, "User with email or username already exists"));
    }

    const user = await User.create({
      username,
      email,
      phone,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken "
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }
    // <br> http://localhost:3000/set-password/${createdUser._id}

    const mail = await sendEmail(
      email,
      "Ecommerce Project",
      "",
      generatePassword(createdUser._id)
    );

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdUser, "User registered Successfully", mail)
      );
  } catch (error) {
    // console.log("Error while registering user", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Error while registering user"));
  }
});

const setPassword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresAt } = req.query; // Get expiration timestamp from query
    const { newPassword, cpassword } = req.body;
    // console.log("Query", req.query);

    if (!expiresAt || Date.now() > Number(expiresAt)) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "Unable to generate password this link has expired"
          )
        );
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password set successfully"));
  } catch (error) {
    console.log("error while setting password", error.message);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    console.log(req.body);

    if (!email) {
      throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const mail = await sendEmail(
      email,
      "Ecommerce Project",
      "",
      generatePassword(user._id)
    );

    return res
      .status(201)
      .json(new ApiResponse(200, {}, mail, "Mail sent for forgot password"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while reseting password");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email);

    if (!email) {
      throw new ApiError(400, "Email is required");
    }
    const user = await User.findOne({ email });

    if (!user) {
      // throw new ApiError(404, "User does not exist");
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      // throw new ApiError(401, "Invalid user credentials");
      return res
        .status(401)
        .json(new ApiError(401, "Invalid user credentials"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
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
          "User logged In Successfully"
        )
      );
  } catch (error) {
    console.log("Error while login user", error.message);
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    console.log("user", req.user._id);
    await User.findByIdAndUpdate(
      req.user._id,

      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged Out"));
  } catch (error) {
    return res.status(200).json(new ApiResponse(200, {}, "Logout failed"));
    //  console.log("Error while logout", error.message);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (oldPassword !== newPassword) {
    throw new ApiError(400, "password does not match");
  }
  const user = await User.findById(req.user?._id);
  // console.log(req.);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  setPassword,
  forgotPassword,
};
