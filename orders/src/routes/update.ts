import express, { Request, Response } from "express";
import { requireAuth, NotFoundError, NotAuthorizedError } from "@cgecommerceproject/common";
import { Order } from "../models/order";

const router = express.Router();

router.put("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = status;
  await order.save();

  res.send(order);
});

export { router as updateOrderRouter };
