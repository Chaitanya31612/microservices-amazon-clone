import mongoose from "mongoose";
import { OrderStatus } from "@cgecommerceproject/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export { OrderStatus };

interface OrderAttrs {
  id: string;
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

export interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// version property will be automatically setup once we use concurrency lib
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
    price: {
      type: Number,
      required: true,
    }
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

// this is used to increment the version number of the document when it is updated, versionKey is the name of the field in the document that will store the version number, and is controlled by lib -mongoose-update-if-current
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
