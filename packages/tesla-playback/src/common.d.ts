import { TeslaFS } from "./TeslaFS";

type Directions = "front" | "left" | "right" | "back";
type VideoGroup = Partial<Record<Directions, File>>;
type PlaybackEvent = Record<TeslaFS.Timestamp, VideoGroup>;
type PlaybackEventGroup = Record<TeslaFS.Timestamp, PlaybackEvent>;
type ClipCategorizedEvents = Partial<Record<TeslaFS.ClipScope, TeslaFS.Timestamp[]>>
