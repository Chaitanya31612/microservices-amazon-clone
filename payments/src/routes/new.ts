import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@cgecommerceproject/common";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { PaymentSucceededPublisher } from "../events/publishers/payment-succeeded-publisher";
import { PaymentFailedPublisher } from "../events/publishers/payment-failed-publisher";
import { kafka } from "../kafka-wrapper";
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

      // Publish payment succeeded event
      try {
        const succeededPublisher = new PaymentSucceededPublisher(kafka.client);
        // Connect the producer before publishing
        await succeededPublisher.connect();

        await succeededPublisher.publish({
          id: payment.id,
          orderId: payment.orderId,
          stripeId: payment.stripeId
        });

        // Optionally disconnect the producer after publishing
        // await succeededPublisher.disconnect();
      } catch (err) {
        console.error('Error publishing payment succeeded event:', err);
        // Continue with the process even if publishing fails
      }

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

      // Update order status to failed
      order.status = OrderStatus.Cancelled;
      await order.save();

      // Publish payment failed event
      try {
        const failedPublisher = new PaymentFailedPublisher(kafka.client);
        // Connect the producer before publishing
        await failedPublisher.connect();

        await failedPublisher.publish({
          orderId: orderId,
          errorMessage: err.message
        });

        // Optionally disconnect the producer after publishing
        // await failedPublisher.disconnect();
      } catch (publishErr) {
        console.error('Error publishing payment failed event:', publishErr);
        // Continue with the process even if publishing fails
      }

      res.status(400).send({ error: err.message });
    }
  }
);

export { router as paymentCheckRouter };
