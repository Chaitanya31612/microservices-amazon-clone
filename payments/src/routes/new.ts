import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@cgecommerceproject/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { stripe } from "../stripe";
import axios from "axios";

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

    if (
      order.status === OrderStatus.Cancelled ||
      order.status === OrderStatus.Complete
    ) {
      throw new BadRequestError("Order is already cancelled or completed");
    }

    order.status = OrderStatus.AwaitingPayment;
    await order.save();

    try {
      // Create a charge using the token from Stripe Checkout
      const charge = await stripe.charges.create({
        amount: Math.round(order.price * 100 * 100) / 100, // Amount in smallest currency unit (paise for INR), rounded to 2 decimal places
        currency: "inr",
        source: token, // Use the token from Stripe Checkout
        description: `Payment for order ${orderId}`,
        // receipt_email: req.currentUser!.email,
        // metadata: {
        //   order_id: orderId,
        //   customer_id: req.currentUser!.id,
        // },
        // shipping: {
        //   name: "John doe",
        //   address: {
        //     line1: "123 Main St",
        //     city: "Mumbai",
        //     postal_code: "400001",
        //     state: "MH",
        //     country: "IN",
        //   },
        // },
      });

      // update status of order
      order.status = OrderStatus.Complete;
      await order.save();

      const payment = Payment.build({
        orderId,
        stripeId: charge.id,
      });
      await payment.save();

      console.log("payment created");

      // update order from orders service, will be doing with async events later, right now doing call to orders-srv
      // not needed to wait for the response
      // console.log("updating order status")
      // await axios.put(`http://orders-srv:3000/api/orders/${orderId}`, {
      //   status: OrderStatus.Complete,
      // }, {
      //   headers: req.headers
      // })

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
