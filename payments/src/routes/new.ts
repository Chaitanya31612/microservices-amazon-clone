import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@cgecommerceproject/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("Token is required"),
    body("orderId").not().isEmpty().withMessage("Order Id is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    console.log("token is ", token);
    console.log("orderId is ", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    try {
      // Create a charge using the token from Stripe Checkout
      const charge = await stripe.charges.create({
        amount: order.price * 100, // Amount in smallest currency unit (paise for INR)
        currency: "inr",
        source: token, // Use the token from Stripe Checkout
        description: `Payment for order ${orderId}`,
        receipt_email: req.currentUser!.email,
        metadata: {
          order_id: orderId,
          customer_id: req.currentUser!.id,
        },
        shipping: {
          name: "John doe",
          address: {
            line1: "123 Main St",
            city: "Mumbai",
            postal_code: "400001",
            state: "MH",
            country: "IN",
          },
        },
      });

      const payment = Payment.build({
        orderId,
        stripeId: charge.id,
      });
      await payment.save();

      res.status(201).send({
        payment,
        order,
      });
    } catch (err) {
      console.log("Something went wrong", err);
      res.status(400).send({ error: err.message });
    }
  }
);

export { router as paymentCheckRouter };
