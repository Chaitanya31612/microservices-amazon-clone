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
    body("productId")
      .not()
      .isEmpty()
      .withMessage("Product Id must be provided"),
    body("quantity")
      .not()
      .isEmpty()
      .withMessage("Quantity must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { productId } = req.body;

    // Find the ticket the user is trying to order in the database
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError();
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      products: [{
        product,
        quantity: req.body.quantity,
      }],
    });
    await order.save();

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
