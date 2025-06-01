import { Listener, OrderStatus, Subjects } from '@cgecommerceproject/common';
import { EachMessagePayload } from 'kafkajs';
import { Order } from '../../models/order';

// Define the interface here until it's available from the common package
interface PaymentSucceededEvent {
  subject: Subjects.PaymentSucceeded;
  data: {
    id: string; // payment id
    orderId: string;
    stripeId: string;
  };
}

export class PaymentSucceededListener extends Listener<PaymentSucceededEvent> {
  readonly subject = Subjects.PaymentSucceeded;
  readonly queueGroupName = 'orders-payment-succeeded-group';

  async onMessage(data: PaymentSucceededEvent['data'], msg: EachMessagePayload) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status to complete
    order.status = OrderStatus.Complete;
    await order.save();

    console.log(`Order ${order.id} marked as complete after successful payment`);
  }
}
