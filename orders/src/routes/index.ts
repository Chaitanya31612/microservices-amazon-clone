import express, { Request, Response } from "express";
import { requireAuth } from "@cgecommerceproject/common";
import { Order } from "../models/order";
import { Product } from "../models/product";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate("products.product");

  const products = await Product.find()

  res.send({orders, products});
});

router.get("/api/orders/user-orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate("products.product");

  res.send(orders);
})

export { router as indexOrderRouter };
