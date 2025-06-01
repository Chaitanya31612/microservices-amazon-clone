import { Publisher, PaymentFailedEvent, Subjects } from '@cgecommerceproject/common';

export class PaymentFailedPublisher extends Publisher<PaymentFailedEvent> {
  readonly subject = Subjects.PaymentFailed;
}
