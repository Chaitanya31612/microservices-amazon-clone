import { Listener, OrderStatus, Subjects } from '@cgecommerceproject/common';
import { EachMessagePayload } from 'kafkajs';
import { Order } from '../../models/order';

// Define the interface here until it's available from the common package
interface PaymentFailedEvent {
  subject: Subjects.PaymentFailed;
  data: {
    orderId: string;
    errorMessage: string;
  };
}

export class PaymentFailedListener extends Listener<PaymentFailedEvent> {
  readonly subject = Subjects.PaymentFailed;
  readonly queueGroupName = 'orders-payment-failed-group';

  async onMessage(data: PaymentFailedEvent['data'], msg: EachMessagePayload) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status to failed
    order.status = OrderStatus.Cancelled;
    await order.save();

    console.log(`Order ${order.id} marked as cancelled due to payment failure: ${data.errorMessage}`);
  }
}
