import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@cgecommerceproject/common";
import { body } from "express-validator";
import { Product } from "../models/product";
import { Order } from "../models/order";

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("items")
      .isArray()
      .withMessage("Items must be provided as an array"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { items } = req.body;

    // Check if items array is empty
    if (items.length === 0) {
      throw new BadRequestError('Order must contain at least one item');
    }

    // Check if user has any existing unexpired orders
    const existingOrder = await Order.findOne({
      userId: req.currentUser!.id,
      status: { $in: [OrderStatus.Created, OrderStatus.AwaitingPayment] },
      expiresAt: { $gt: new Date() }
    });

    if (existingOrder) {
      existingOrder.status = OrderStatus.Cancelled;
      await existingOrder.save();
      console.log("previous order cancelled")
    }

    // Find all products the user is trying to order
    const products = await Promise.all(
      items.map(async (item: { productId: number, quantity: number }) => {
        const product = await Product.findOne({ id: item.productId });
        if (!product) {
          throw new NotFoundError();
        }
        return { product, quantity: item.quantity };
      })
    );

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      products: products,
    });
    await order.save();

    console.log("new order created")
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
