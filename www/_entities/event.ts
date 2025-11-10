import type { TCreateNewEvent, TNewEvent, TEvent } from "utils/schemas.zod";
import {
  NEW_EVENT_DEFAULT_SCHEDULE,
  type AVAILABLE_TIMEZONES,
} from "~/defaults";

type TSchedule =
  | {
      date: Date;
      startTime: string;
      endTime: string;
      timezone: (typeof AVAILABLE_TIMEZONES)[number];
    }
  | undefined;
type TRsvp = {
  isRequired: boolean;
  deadline:
    | {
        date: Date;
        time: string;
        timezone: (typeof AVAILABLE_TIMEZONES)[number];
      }
    | undefined;
};

export class EventEntity {
  protected _issues: string[] = [];
  protected _schedule: TSchedule;
  protected _rsvp: TRsvp = { isRequired: false, deadline: undefined };

  constructor(
    public id: TEvent["id"],
    public title: TEvent["title"],
    public date: TEvent["date"],
    public venue: TEvent["venue"],
    public guests: TEvent["guests"]
  ) {
    this._schedule = this.date
      ? {
          ...EventEntity.defaultSchedule(),
          date: this.date,
        }
      : undefined;
  }

  static defaultSchedule(): NonNullable<TSchedule> {
    return {
      date: NEW_EVENT_DEFAULT_SCHEDULE.date,
      startTime: `${NEW_EVENT_DEFAULT_SCHEDULE.startTime.hour}:${NEW_EVENT_DEFAULT_SCHEDULE.startTime.min} ${NEW_EVENT_DEFAULT_SCHEDULE.startTime.period}`,
      endTime: `${NEW_EVENT_DEFAULT_SCHEDULE.endTime.hour}:${NEW_EVENT_DEFAULT_SCHEDULE.endTime.min} ${NEW_EVENT_DEFAULT_SCHEDULE.endTime.period}`,
      timezone: NEW_EVENT_DEFAULT_SCHEDULE.timezone,
    };
  }

  get schedule(): TSchedule {
    return this._schedule ? { ...this._schedule } : undefined;
  }

  set schedule(value: NonNullable<TSchedule>) {
    this._schedule = value;
  }

  get venueType(): NonNullable<TNewEvent["venue"]>["type"] {
    return this.venue?.type || "physical";
  }

  get venueUrl(): string | undefined {
    return this.venue?.url;
  }

  get venueName(): string | undefined {
    return this.venue?.name;
  }

  get venueAddress(): NonNullable<TNewEvent["venue"]>["address"] | undefined {
    return this.venue?.address;
  }

  get rsvp(): TRsvp {
    return { ...this._rsvp };
  }

  set rsvp(value: TRsvp) {
    this.rsvp = {
      isRequired: value.isRequired,
      deadline: value.deadline,
    };
  }

  get issues(): string[] {
    return [...this._issues];
  }

  set issues(issues: string[]) {
    this._issues = issues;
  }
}
