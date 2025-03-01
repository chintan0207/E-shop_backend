import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: false,
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);
export const Cart = mongoose.model("Cart", cartSchema);
