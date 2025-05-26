import express, { Request, Response } from 'express'
import { requireAuth, validateRequest } from '@cgecommerceproject/common'
import { body } from 'express-validator'
import { Order } from '../models/order'

const router = express.Router();

// this is temporary until async communication is setup
router.post("/api/payments/create-order",
  requireAuth,
  [body("id").not().isEmpty().withMessage("Id is required"),
    body("userId").not().isEmpty().withMessage("User Id is required"),
    body("status").not().isEmpty().withMessage("Status is required"),
    body("price").not().isEmpty().withMessage("Price is required")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id, userId, status, price } = req.body;

    const order = Order.build({
      id,
      userId,
      status,
      price
    })

    await order.save();

    res.status(201).send(order);
  }
)

export { router as createOrderRouter }
