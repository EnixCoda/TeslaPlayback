import { assert } from "./utils/assert";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TeslaFS {
  export type Timestamp =
    | string
    | `${string}-${string}-${string}_${string}-${string}-${string}` // YYYY-MM-DD_HH-MM-SS
    | `${string}-${string}-${string}_${string}-${string}`; // YYYY-MM-DD_HH-MM

  export const clipScopes = ["RecentClips", "SavedClips", "SentryClips"] as const;
  export type ClipScope = ValueOfArray<typeof clipScopes>;

  export function formatTimestamp(timestamp: TeslaFS.Timestamp) {
    const [date, time] = timestamp.split("_").map((part) => part.split("-"));
    return [date.join("-"), time.join(":")].join(" ");
  }

  export function parseTimestamp(timestamp: TeslaFS.Timestamp) {
    const [date, time] = timestamp.split("_").map((part) => part.split("-"));
    return new Date(`${date.join("-")}T${time.join(":")}`);
  }

  export const parseFileNameDate = (fileName: string) => {
    const matched = fileName.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
    assert(matched, `Invalid filename name: ${fileName}`);
    const [, YYYY, mm, DD, HH, MM, SS] = matched;
    return new Date(`${YYYY}-${mm}-${DD}T${HH}:${MM}:${SS}`);
  };

  export const SUFFIXES = {
    FRONT: "front",
    REAR: "back",
    REAR_VIEW: "rear_view",
    LEFT_REPEATER: "left_repeater",
    RIGHT_REPEATER: "right_repeater",
  } as const;

  export const VIDEO_FILE_EXT = ".mp4";

  // example:
  // 2000-01-01_01-01-front.mp4
  // 2000-01-01_01-01-01-front.mp4
  export type PlaybackFileName = `${Timestamp}-${ValueOf<typeof SUFFIXES>}${typeof VIDEO_FILE_EXT}`;

  export type VideoFileList = Record<PlaybackFileName, File>;

  // The structure is actually not exposed to web apps
  export type DirectoryStructure = {
    TeslaCam: {
      RecentClips: VideoFileList;
      SavedClips: Record<Timestamp, VideoFileList>;
      SentryClips: Record<Timestamp, VideoFileList>;
    };
  };
}
