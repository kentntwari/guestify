import { atom, createStore } from "jotai";
import { atomWithReset } from "jotai/utils";

import { eventAddOns } from "~/components/app/addOns.parts";

import { type TNewEvent } from "utils/schemas.zod";

import {
  NEW_EVENT_DEFAULT_RSVP,
  NEW_EVENT_DEFAULT_SCHEDULE,
  NEW_EVENT_DEFAULT_VENUE,
} from "~/defaults";

export type TAddOnAtom<T extends (typeof eventAddOns)[number]> = {
  type: T;
  isCompleted: boolean;
  data: T extends "schedule"
    ? TNewEvent["schedule"]
    : T extends "venue"
    ? TNewEvent["venue"]
    : T extends "rsvp"
    ? TNewEvent["rsvp"]
    : null;
};
export type TRSVPAddonAtom = TAddOnAtom<"rsvp">;
export type TVenueAddOnAtom = TAddOnAtom<"venue">;
export type TScheduleAddOnAtom = TAddOnAtom<"schedule">;

export const addOnsStore = createStore();

export const scheduleAddOnAtom = atomWithReset<TScheduleAddOnAtom>({
  type: "schedule",
  isCompleted: false,
  data: NEW_EVENT_DEFAULT_SCHEDULE,
} satisfies TScheduleAddOnAtom);
export const venueAddOnAtom = atomWithReset<TVenueAddOnAtom>({
  type: "venue",
  isCompleted: false,
  data: NEW_EVENT_DEFAULT_VENUE,
} satisfies TVenueAddOnAtom);
export const rsvpAddOnAtom = atomWithReset<TRSVPAddonAtom>({
  type: "rsvp",
  isCompleted: false,
  data: NEW_EVENT_DEFAULT_RSVP,
} satisfies TRSVPAddonAtom);

export const isDialogOpenAtom = atom(false);
