import { Publisher, PaymentSucceededEvent, Subjects } from '@cgecommerceproject/common';

export class PaymentSucceededPublisher extends Publisher<PaymentSucceededEvent> {
  readonly subject = Subjects.PaymentSucceeded;
}
