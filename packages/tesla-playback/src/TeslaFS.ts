export namespace TeslaFS {
  export type Timestamp =
    | string
    | `${string}-${string}-${string}_${string}-${string}-${string}` // YYYY-MM-DD_HH-MM-SS
    | `${string}-${string}-${string}_${string}-${string}`; // YYYY-MM-DD_HH-MM

  export const clipScopes = ["RecentClips", "SavedClips", "SentryClips"] as const;
  export type ClipScope = ValueOfArray<typeof clipScopes>;

  export const SUFFIXES = {
    FRONT: "front",
    BACK: "back",
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
