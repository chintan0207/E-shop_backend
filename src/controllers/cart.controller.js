import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const calculateTotalPrice = async (items) => {
  let totalPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      totalPrice += product.price * item.quantity;
    }
  }

  return Number(totalPrice);
};
const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?._id;
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json(new ApiError(404, "Product not found"));
    }
    //find user's cart
    let cart = await Cart.findOne({ userId });

    console.log("cart", cart);
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }],
        totalPrice: (product.price * quantity).toFixed(2),
      });
    } else {
      // Check if the product is already in the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      console.log("indexi", itemIndex);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        // add new product
        cart.items.push({ productId, quantity });
      }
      // Recalculate the total price
      cart.totalPrice = await calculateTotalPrice(cart.items);
    }
    await cart.save();
    return res.status(201).json(new ApiResponse(200, cart, "Item add to cart"));
  } catch (error) {
    console.log("Error while add to cart", error.message);
    return res.status(500).json(new ApiError(500, "Error while add to cart"));
  }
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user?._id;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json(new ApiError(404, "Cart not found."));
    }

    // Find the index of the product to remove
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    console.log(itemIndex);

    if (itemIndex === -1) {
      return res
        .status(404)
        .json(new ApiError(404, "Product not found in cart."));
    }
    console.log("cart items before", cart.items);

    // Remove the product from the cart
    console.log(cart.items.splice(itemIndex, 1));

    console.log("After removing:", cart.items);

    // Recalculate the total price
    cart.totalPrice = await calculateTotalPrice(cart.items);

    // Save the updated cart
    await cart.save();
    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Item removed from cart."));
  } catch (error) {
    console.error("Error while removing from cart:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Error while removing from cart."));
  }
});

const getCartById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json(new ApiError(404, "Cart not found."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart retrieved successfully."));
  } catch (error) {
    console.error("Error while fetching cart:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Error while fetching cart."));
  }
});

const modifyQuantity = asyncHandler(async (req, res) => {
  const { productId, action } = req.body;
  const userId = req.user?._id;

  if (!["increase", "decrease"].includes(action)) {
    return res.status(400).json(new ApiError(400, "Invalid action"));
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json(new ApiError(404, "Cart not found"));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json(new ApiError(404, "Product not found in cart"));
    }

    // Modify quantity based on the action
    if (action === "increase") {
      cart.items[itemIndex].quantity += 1;
    } else if (action === "decrease" && cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      return res
        .status(400)
        .json(new ApiError(400, "Quantity cannot be less than 1"));
    }

    cart.totalPrice = await calculateTotalPrice(cart.items);

    // Save the cart
    await cart.save();

    return res
      .status(200)
      .json(new ApiResponse(200, cart, `Quantity ${action}d`));
  } catch (error) {
    console.error("Error while modifying quantity", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Error while modifying quantity"));
  }
});

export { addToCart, removeFromCart, getCartById, modifyQuantity };
