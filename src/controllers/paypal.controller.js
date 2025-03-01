import { asyncHandler } from "../utils/asyncHandler.js";
import paypal from "@paypal/checkout-server-sdk";
import axios from "axios";

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID, // Replace with your PayPal Sandbox Client ID
  process.env.PAYPAL_SECRET_KEY // Replace with your PayPal Sandbox Client Secret
);

const client = new paypal.core.PayPalHttpClient(environment);

const createOrder = asyncHandler(async (req, res) => {
  const { total } = req.body; // Get the total value from the request
  const roundedTotal = total.toFixed(2);
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD", // Specify currency (you can change it)
          value: roundedTotal, // Total value from your cart
        },
      },
    ],
    application_context: {
      return_url: "http://localhost:3000/success-payment",
      cancel_url: "http://localhost:3000/cancel-payment",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
    },
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (err) {
    console.error("Error creating PayPal order:", err);
    res.status(422).json({ error: "Error creating PayPal order." });
  }
});

const captureOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  console.log(orderId);

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const captureResponse = await client.execute(request);
    console.log(captureResponse);

    // Check if capture was successful
    if (captureResponse.result.status === "COMPLETED") {
      return res.status(200).json(captureResponse.result);
    } else {
      console.error("Failed to capture order:", captureResponse.result);
      return res.status(500).json({ error: "Failed to capture the order" });
    }
  } catch (error) {
    console.error(
      "Error capturing PayPal order:",
      error.response || error.message
    );
    return res.status(500).json({ error: "Failed to capture order" });
  }
});

export { createOrder, captureOrder };
