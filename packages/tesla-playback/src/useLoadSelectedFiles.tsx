import * as React from "react";
import { ClipCategorizedEvents, Directions, PlaybackEventGroup } from "./common";
import { TeslaFS } from "./TeslaFS";

const suffixToDirectionMap: Record<ValueOf<typeof TeslaFS.SUFFIXES>, Directions> = {
  [TeslaFS.SUFFIXES.FRONT]: "front",
  [TeslaFS.SUFFIXES.BACK]: "back",
  [TeslaFS.SUFFIXES.REAR_VIEW]: "back",
  [TeslaFS.SUFFIXES.LEFT_REPEATER]: "left",
  [TeslaFS.SUFFIXES.RIGHT_REPEATER]: "right",
};

const findTimestamp = (str?: string): TeslaFS.Timestamp | undefined => str?.match(/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}(-\d{2})?/)?.[0];

export function useLoadSelectedFiles(setEventGroup: ReactSet<PlaybackEventGroup>, setScopes: ReactSet<ClipCategorizedEvents>) {
  return React.useCallback((files: FileList | null) => {
    if (files === null) return;

    const scopes: ClipCategorizedEvents = {
      RecentClips: [],
      SavedClips: [],
      SentryClips: [],
    };
    const newSavedEvents: PlaybackEventGroup = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name.toLowerCase();

      if (filename.startsWith(".")) continue; // ignore hidden files
      if (!filename.endsWith(TeslaFS.VIDEO_FILE_EXT)) continue;

      const playbackTimestamp = findTimestamp(file.name);
      const splitDirectories = file.webkitRelativePath.split("/");
      const eventTimestamp = findTimestamp(splitDirectories[splitDirectories.length - 2]);
      if (!playbackTimestamp || !eventTimestamp) {
        console.warn(`"${file.name}" is unrecognizable: "${file.webkitRelativePath}"`);
        continue;
      }

      const scope = TeslaFS.clipScopes.find((scope) => splitDirectories.includes(scope));
      if (scope) scopes[scope]?.push(eventTimestamp);

      const event = (newSavedEvents[eventTimestamp] ||= {});

      for (const [keyword, direction] of Object.entries(suffixToDirectionMap)) {
        if (filename.includes(keyword)) {
          const filesMap = (event[playbackTimestamp] ||= {});
          if (filesMap[direction]) {
            console.warn(`Found duplicated file for "${playbackTimestamp}" in direction "${direction}"`);
            console.warn(filesMap[direction]?.webkitRelativePath, file.webkitRelativePath);
          }
          filesMap[direction] = file;
          break;
        }
      }
    }

    setEventGroup(newSavedEvents);
    setScopes(scopes);
  }, []);
}
