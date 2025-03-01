import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

const createDefaultAdmin = async () => {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminRole = process.env.ADMIN_ROLE || "admin";

  try {
    const existAdmin = await User.findOne({ email: adminEmail });

    if (existAdmin) {
      console.log("Admin already exists");
    }

    const admin = new User({
      username: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
      role: adminRole,
    });

    await admin.save();
    console.log("Default admin created successfully.");
    const createdAdmin = await User.findById(admin._id).select(
      "-password -refreshToken "
    );

    if (!createdAdmin) {
      throw new ApiError(500, "Something went wrong while creating the admin");
    }
  } catch (error) {
    console.log("Error creating default admin", error.message);
  }
};

export { createDefaultAdmin };
