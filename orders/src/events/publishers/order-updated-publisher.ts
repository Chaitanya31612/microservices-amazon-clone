import { Publisher, OrderUpdatedEvent, Subjects } from '@cgecommerceproject/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated;
}
