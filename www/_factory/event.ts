import { ApplicationError } from "../errors/application";
import {
  BackendCreateEventApiResponseSchema,
  NewEventSchema,
} from "utils/schemas.zod";
import { EventEntity } from "_entities/event";
import { ConfigUtils } from "utils/config";
import { BackendApiClient } from "_client/backend";

export class EventFactory {
  static toBackendApiClient(userKey: string) {
    try {
      return new BackendApiClient(new ConfigUtils(userKey));
    } catch (error) {
      throw new EventFactoryError(
        "Failed to prepare event factory client",
        error
      );
    }
  }

  static toValidateEvent(data: unknown) {
    const { success, error, data: res } = NewEventSchema.safeParse(data);
    if (!success) throw new EventFactoryError(error.message);
    const e = new EventEntity(
      undefined,
      res.title,
      !res.schedule ? undefined : new Date(res.schedule?.date),
      res.venue,
      res.numberOfGuests
    );

    if (res.rsvp && res.rsvp.isRequired)
      e.rsvp = {
        isRequired: res.rsvp.isRequired,
        deadline: {
          date: new Date(res.rsvp.deadline.date),
          time: `${res.rsvp.deadline.time.hour}:${res.rsvp.deadline.time.min} ${res.rsvp.deadline.time.period}`,
          timezone: res.rsvp.deadline.timezone,
        },
      };

    return e;
  }

  static validateCreatedEvent(data: unknown) {
    const {
      success,
      error,
      data: res,
    } = BackendCreateEventApiResponseSchema.safeParse(data);

    if (!success) throw new EventFactoryError(error.message);
    const createdEventFromBackend = new EventEntity(
      res.id,
      res.title,
      res.date ? new Date(res.date) : undefined,
      undefined,
      null // numberOfGuests is not returned from backend
    );

    if (res.issues && res.issues.length > 0)
      createdEventFromBackend.issues = res.issues;

    return createdEventFromBackend;
  }
}

export class EventFactoryError extends ApplicationError {
  constructor(message: string, error: unknown = null) {
    super(message);
    this.name = "EVENTS FACTORY ERROR";
    this.context = error ?? {};
  }
}
