import { BaseMapper } from "./_base";
import type { EventEntity } from "_entities/event";
import type { TCreateNewEvent } from "utils/schemas.zod";

export type CreateEventDTO = TCreateNewEvent;
export class EventMapper extends BaseMapper {
  static toCreateDto(data: EventEntity): CreateEventDTO {
    return {
      title: data.title,
      numberOfGuests: data.guests ?? 0,
      schedule: data.schedule
        ? {
            date: data.schedule.date,
            startTime: data.schedule.startTime,
            endTime: data.schedule.endTime,
            timezone: data.schedule.timezone,
          }
        : null,
      venue: data.venue || null,
      rsvp: { ...data.rsvp, deadline: data.rsvp?.deadline || null },
    };
  }
}
