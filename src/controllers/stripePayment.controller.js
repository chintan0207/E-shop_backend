import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Stripe } from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const stripePayment = asyncHandler(async (req, res) => {
  const { totalAmount } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // Replace with your desired currency (e.g., "usd")
            product_data: {
              name: "Total Payment", // Description for the payment
            },
            unit_amount: totalAmount * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success-payment",
      cancel_url: "http://localhost:3000/cancel-payment",
    });
    res.json({ url: session.url }); // Send back the session URL to redirect the user
  } catch (error) {
    res.status(500).json(new ApiError(500, "error creating session checkout"));
  }
});

export { stripePayment };
