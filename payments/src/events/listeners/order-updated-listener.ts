import { Listener, OrderUpdatedEvent, Subjects } from '@cgecommerceproject/common';
import { EachMessagePayload } from 'kafkajs';
import { Order } from '../../models/order';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated;
  readonly queueGroupName = 'payments-order-updated-group';

  async onMessage(data: OrderUpdatedEvent['data'], msg: EachMessagePayload) {
    const order = await Order.findById(data.id);

    if (!order) {
      throw new Error('Order not found');
    }

    // Update the order status
    order.status = data.status;
    await order.save();

    console.log(`Order ${order.id} updated in payments service`);
  }
}
