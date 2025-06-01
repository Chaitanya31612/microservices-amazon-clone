import { Publisher, OrderCreatedEvent, Subjects } from '@cgecommerceproject/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
