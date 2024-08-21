import { TeslaFS } from "./TeslaFS";

export type Directions = "front" | "left" | "right" | "rear";
export const directions: Directions[] = ["front", "left", "right", "rear"];
export type VideoClipGroup = Partial<Record<Directions, File>>;
export type PlaybackEvent = Record<TeslaFS.Timestamp, VideoClipGroup>;
export type PlaybackEventGroup = Record<TeslaFS.Timestamp, PlaybackEvent>;
export type PlaybackMergedEventGroup = Record<TeslaFS.Timestamp, PlaybackEvent>;
export type PlaybackCategorizedGroup = Record<TeslaFS.ClipCategory, TeslaFS.Timestamp[]>;
