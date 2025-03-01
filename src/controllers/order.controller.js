import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";

const createOrder = asyncHandler(async (req, res) => {
  const { products, paymentInfo, deliveryAddress } = req.body;
  const userId = req.user?._id;

  

  //   if (!products || !products.length || !paymentInfo || !deliveryAddress) {
  //     return res
  //       .status(400)
  //       .json(new ApiError(400, "All fields are required to create an order."));
  //   }
});

const getOrderById = asyncHandler(async (req, res) => {});

const getUserOrder = asyncHandler(async (req, res) => {});

export { createOrder };

// Create Order: Place an order, manage payment, and track stock.
// Get All Orders: Admin-level analytics and tracking.
// Get User Orders: User-specific order history.
// Get Order by ID: Detailed view of a single order.
// Update Status: Order lifecycle tracking.
// Delete Order: Clean-up or invalid/cancelled order management.
// Calculate Summary: Pre-checkout validation.
// Track Status: Real-time updates for the user.
