import { EventFactory, EventFactoryError } from "_factory/event";
import { Base as BaseService, type IBaseService } from "./_base";
import type { EventEntity } from "_entities/event";
import { ApplicationError } from "errors/application";
import { NetworkError } from "errors/network";
import { EventMapper } from "_mapper/event";

export interface IEventService extends IBaseService<{}, EventMapper> {
  registerEvent(event: EventEntity, userKey: string): Promise<EventMapper>;
}

export class EventService extends BaseService implements IEventService {
  constructor() {
    super();
  }

  public async registerEvent(event: EventEntity, userKey: string) {
    try {
      const createdEvent =
        await EventFactory.toBackendApiClient(userKey).create.event(event);
      return EventMapper.toResultSuccess(
        "created",
        EventFactory.validateCreatedEvent(createdEvent)
      );
    } catch (error) {
      return EventMapper.toResultError(this.mapError(error));
    }
  }

  protected mapError(error: unknown) {
    console.log(error);
    switch (true) {
      case error instanceof EventServiceError ||
        error instanceof NetworkError ||
        error instanceof ApplicationError:
        return error;

      case error instanceof EventFactoryError:
        return new EventServiceError("Error occurred in EventFactory", error);

      default:
        return new EventServiceError(
          "Unexpected error occurred in EventService class",
          error
        );
    }
  }
}

export class EventServiceError extends Error {
  constructor(message: string, rawError: unknown = null) {
    super(message);
    this.name = "EVENT SERVICE ERROR";
    if (rawError) console.log(rawError);
  }
}
