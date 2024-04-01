import * as React from "react";
import { TeslaFS } from "../TeslaFS";
import { Directions, EventsIndex, PlaybackEventGroup } from "../common";

const suffixToDirectionMap: Record<ValueOf<typeof TeslaFS.SUFFIXES>, Directions> = {
  [TeslaFS.SUFFIXES.FRONT]: "front",
  [TeslaFS.SUFFIXES.REAR]: "rear",
  [TeslaFS.SUFFIXES.REAR_VIEW]: "rear",
  [TeslaFS.SUFFIXES.LEFT_REPEATER]: "left",
  [TeslaFS.SUFFIXES.RIGHT_REPEATER]: "right",
};

const findTimestamp = (str?: string): TeslaFS.Timestamp | undefined => str?.match(/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}(-\d{2})?/)?.[0];

export function useDashCamEvents(files: FileListLike) {
  return React.useMemo(() => {
    const eventsIndex: EventsIndex = {
      RecentClips: [],
      SavedClips: [],
      SentryClips: [],
    };
    const parserLog: { file: File; message: string }[] = [];
    const eventGroup: PlaybackEventGroup = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name.toLowerCase();

      if (filename.startsWith(".")) continue; // ignore hidden files
      if (["event.json", "thumb.png"].includes(filename)) continue;
      if (!filename.endsWith(TeslaFS.VIDEO_FILE_EXT)) {
        parserLog.push({ file, message: `File name not end with "${TeslaFS.VIDEO_FILE_EXT}"` });
        continue;
      }

      const playbackTimestamp = findTimestamp(file.name);
      const splitDirectories = file.webkitRelativePath.split("/");
      const eventTimestamp =
        findTimestamp(splitDirectories[splitDirectories.length - 2]) ||
        // for RecentClips, files are not grouped with folders
        findTimestamp(splitDirectories[splitDirectories.length - 1]);
      if (!playbackTimestamp || !eventTimestamp) {
        parserLog.push({ file, message: `File name does not match expected pattern` });
        continue;
      }

      const scope = TeslaFS.clipScopes.find((scope) => splitDirectories.includes(scope));
      if (scope) eventsIndex[scope]?.push(eventTimestamp);

      const event = (eventGroup[eventTimestamp] ||= {});

      for (const [keyword, direction] of Object.entries(suffixToDirectionMap)) {
        if (filename.includes(keyword)) {
          const filesMap = (event[playbackTimestamp] ||= {});
          const fileInMap = filesMap[direction];
          if (fileInMap) {
            parserLog.push({
              file: fileInMap,
              message: `Found duplicated file for "${playbackTimestamp}" in direction "${direction}": ${
                (fileInMap?.webkitRelativePath, fileInMap.webkitRelativePath)
              }`,
            });
          }
          filesMap[direction] = file;
          break;
        }
      }
    }

    return {
      eventGroup,
      eventsIndex,
      parserLog,
    };
  }, [files]);
}
