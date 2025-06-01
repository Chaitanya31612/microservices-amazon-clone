import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from '@cgecommerceproject/common';
import { EachMessagePayload } from 'kafkajs';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = 'payments-order-created-group';

  async onMessage(data: OrderCreatedEvent['data'], msg: EachMessagePayload) {
    // Calculate the total price from the products array
    const order = Order.build({
      id: data.id,
      userId: data.userId,
      status: data.status,
      price: data.totalPrice
    });

    await order.save();

    console.log(`Order created in payments service: ${order.id}`);
  }
}
