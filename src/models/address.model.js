import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v.toString());
        },
        message: (props) => `${props.value} is not a valid pincode!`,
      },
    },
    country: {
      type: String,
      required: true,
      default: "India",
      trim: true,
    },
    // isDefault: {
    //   type: Boolean,
    //   default: false, // Marks if this address is the default address
    // },
  },
  { timestamps: true }
);

export const Address = mongoose.model("Address", addressSchema);
