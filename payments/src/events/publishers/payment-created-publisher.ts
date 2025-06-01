import { Publisher, PaymentCreatedEvent, Subjects } from '@cgecommerceproject/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
