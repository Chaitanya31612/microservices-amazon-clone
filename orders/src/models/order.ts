import mongoose from "mongoose";
import { OrderStatus } from "@cgecommerceproject/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export { OrderStatus };

import { ProductDoc } from "./product";

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  products: Array<{
    product: ProductDoc;
    quantity: number;
  }>;
}

export interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  products: Array<{
    product: ProductDoc;
    quantity: number;
  }>;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    products: [{
      product: {
        type: {
          id: {
            type: Number,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          category: {
            type: String,
            required: true,
          },
          image: {
            type: String,
            required: true,
          },
        },
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    }],
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Configure optimistic concurrency control
// This sets the field name that will track the version number
orderSchema.set("versionKey", "version");
// Apply the plugin that handles incrementing the version on document updates
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
