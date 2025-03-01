import { Address } from "../models/address.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const addresses = await Address.find({ userId });
    if (!addresses || addresses.length === 0) {
      return res
        .status(404)
        .json(new ApiError(404, "No addresses found for this user"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, addresses, "Addresses retrieved successfully")
      );
  } catch (error) {
    console.log("Error retrieving addresses:", error.messsage);
    return res
      .status(500)
      .json(new ApiError(500, "An error occurred while retrieving addresses"));
  }
});
const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  if (!addressId) {
    return res.status(400).json(new ApiError(404, "AddressId is required"));
  }
  try {
    const address = await Address.findById(addressId);

    if (!address) {
      return res
        .status(404)
        .json(new ApiError(404, "No address found with the provided ID"));
    }
    res
      .status(200)
      .json(new ApiResponse(200, address, "Address retrieved successfully"));
  } catch (error) {
    console.log("Error while retrieving address:", error.messsage);
    return res
      .status(500)
      .json(new ApiError(500, "Error while retriving address"));
  }
});
const createAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { addressLine1, addressLine2, city, state, pincode, country } =
    req.body;

  if (!userId) {
    return res.status(401).json(new ApiError(401, "User is not authenticated"));
  }

  if (!addressLine1 || !city || !state || !pincode || !country) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Address Line 1, City, State, Pincode, and Country are required"
        )
      );
  }
  try {
    const user = await User.findById(userId).select("username email phone");
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const newAddress = await Address.create({
      userId,
      name: user.username,
      email: user.email,
      mobile: user.phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          newAddress,
          "Address created successfully with user details"
        )
      );
  } catch (error) {
    console.log("Error creating Address:", error.messsage);
    return res
      .status(500)
      .json(
        new ApiError(500, "An error occurred while creating the address", error)
      );
  }
});
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) {
    return res.status(400).json(new ApiError(404, "AddressId is required"));
  }
  try {
    const address = await Address.findByIdAndDelete(addressId);
    res
      .status(200)
      .json(new ApiResponse(200, address, "Address deleted Successfully!"));
  } catch (error) {
    console.log("Error while deleting address:", error.messsage);
    return res
      .status(500)
      .json(new ApiError(500, "Error while deleting address"));
  }
});
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { addressLine1, addressLine2, city, state, pincode, country } =
    req.body;
  if (!addressId) {
    return res.status(400).json(new ApiError(404, "AddressId is required"));
  }
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
      },
      { new: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedAddress, "Address updated Successfully")
      );
  } catch (error) {
    console.log("Error while updatting address:", error.messsage);
    return res
      .status(500)
      .json(new ApiError(500, "Error while updating address"));
  }
});

// const getDefaultAddress = asyncHandler(async (req, res) => {
//   const userId = req.user._id;

//   try {
//     // Find the default address for the user
//     const defaultAddress = await Address.findOne({ userId, isDefault: true });

//     if (!defaultAddress) {
//       return res
//         .status(404)
//         .json(new ApiError(404, "No default address found for this user"));
//     }

//     res
//       .status(200)
//       .json(
//         new ApiResponse(200, defaultAddress, "Default address retrieved successfully")
//       );
//   } catch (error) {
//     console.error("Error retrieving default address:", error.message);
//     return res
//       .status(500)
//       .json(new ApiError(500, "Error occurred while retrieving default address"));
//   }
// });

export {
  getAddresses,
  getAddressById,
  createAddress,
  deleteAddress,
  updateAddress,
};
