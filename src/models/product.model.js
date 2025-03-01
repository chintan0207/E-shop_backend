import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    // category: { type: Schema.Types.ObjectId, ref: "Category", required: false }, // reference by category id
    category: { type: String, required: true },

    mainImage: {
      type: String,
      required: true,
    },
    subImages: {
      type: [String], // Array of strings
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    Reviews: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the admin user
      required: true,
    },
  },
  { timestamps: true }
);
export const Product = mongoose.model("Product", productSchema);
