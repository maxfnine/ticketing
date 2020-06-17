import {
  Subjects,
  ExpirationCompleteEvent,
  Publisher,
} from "@mftickets/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
