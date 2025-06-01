import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@cgecommerceproject/common";
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { kafka } from '../kafka-wrapper';
import { body } from "express-validator";
import { Product } from "../models/product";
import { Order } from "../models/order";
import { OrderUpdatedPublisher } from "../events/publishers/order-updated-publisher";

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("items").isArray().withMessage("Items must be provided as an array"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { items, price } = req.body;

    // Check if items array is empty
    if (items.length === 0) {
      throw new BadRequestError("Order must contain at least one item");
    }

    // Check if user has any existing unexpired orders
    const existingOrder = await Order.findOne({
      userId: req.currentUser!.id,
      status: { $in: [OrderStatus.Created] },
      expiresAt: { $gt: new Date() },
    });

    if (existingOrder) {
      existingOrder.status = OrderStatus.Cancelled;
      await existingOrder.save();
      console.log("previous order cancelled");

      // Publish order updated event, for payments service to know about the change
      try {
        const publisher = new OrderUpdatedPublisher(kafka.client);
        // Connect the producer before publishing
        await publisher.connect();
        
        await publisher.publish({
          id: existingOrder.id,
          version: existingOrder.version,
          userId: existingOrder.userId,
          status: OrderStatus.Cancelled // update the status to cancelled
        });
        
        // Optionally disconnect the producer after publishing
        // await publisher.disconnect();
      } catch (err) {
        console.error('Error publishing order updated event:', err);
        // Continue with the process even if publishing fails
      }
    }

    // Find all products the user is trying to order
    const products = await Promise.all(
      items.map(async (item: { productId: number; quantity: number }) => {
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

    console.log("new order created");

    // Publish an event saying that an order was created
    try {
      const publisher = new OrderCreatedPublisher(kafka.client);
      // Connect the producer before publishing
      await publisher.connect();
      
      await publisher.publish({
        id: order.id,
        version: order.version,
        userId: order.userId,
        status: order.status,
        expiresAt: order.expiresAt.toISOString(),
        products: order.products.map((item) => ({
          product: {
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            description: item.product.description,
            category: item.product.category,
            image: item.product.image,
          },
          quantity: item.quantity,
        })),
        totalPrice: price,
      });
      
      // Optionally disconnect the producer after publishing
      // await publisher.disconnect();
    } catch (err) {
      console.error('Error publishing order created event:', err);
      // We're still sending the response with the order, even if event publishing fails
      // You might want to handle this differently based on your requirements
    }

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
