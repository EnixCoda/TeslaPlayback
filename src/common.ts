import { TeslaFS } from "./TeslaFS";

export type Directions = "front" | "left" | "right" | "back";
export type VideoClipGroup = Partial<Record<Directions, File>>;
export type PlaybackEvent = Record<TeslaFS.Timestamp, VideoClipGroup>;
export type PlaybackEventGroup = Record<TeslaFS.Timestamp, PlaybackEvent>;
export type EventsIndex = Partial<Record<TeslaFS.ClipScope, TeslaFS.Timestamp[]>>;
