import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Directions, directions } from "../../common";
import { FFmpegArgsComposer } from "../ffmpegArgsComposer/FFmpegArgsComposer";
import { DrawTextStyle } from "../ffmpegArgsComposer/DrawTextArgs";
import { entries, fromEntries, isNotFalsy, readFileAsArrayBuffer } from "../general";
import { addTimestampToVideo } from "./addTimestampToVideo";
import { addTextToVideo } from "./addTextToVideo";
import { filenames } from "./filenames";
import { spellBook } from "./spellBook";
import { trimVideo } from "./trimVideo";
import { videoHeight, videoWidth } from "./constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VideoProcessJob<Args extends any[]> = (ffmpeg: FFmpeg, ...args: Args) => ReturnType<FFmpeg["readFile"]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ProcessWork<Args extends any[]> {
  (ffmpeg: FFmpeg, composer: FFmpegArgsComposer, ...args: Args): Promise<void> | void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getArgs<Args extends any[]>(composeArgs: ProcessWork<Args>, ffmpeg: FFmpeg, args: Args) {
  const composer = new FFmpegArgsComposer();
  await composeArgs(ffmpeg, composer, ...args);
  composer.append(filenames.output);
  return composer.getArgs();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProcessJob: <Args extends any[]>(work: ProcessWork<Args>) => VideoProcessJob<Args> =
  (work) =>
  async (ffmpeg, ...args) => {
    const ffmpegArgs = await getArgs(work, ffmpeg, args);
    console.debug("ffmpegArgs", ffmpegArgs.join("\n"));
    await ffmpeg.exec(ffmpegArgs);
    return await ffmpeg.readFile(filenames.output);
  };

export const processVideoWork: ProcessWork<
  [
    Partial<Record<Directions, File | undefined>>,
    {
      text?: {
        content: string | Date;
        style: DrawTextStyle;
      };
      trim?: { startTime?: number; endTime?: number };
    }
  ]
> = async (ffmpeg, composer, files, { text, trim }): Promise<void> => {
  const inputs = directions
    .map((direction) => {
      const file = files[direction];
      const filename = filenames[direction];
      return file && ([file, filename] as const);
    })
    .filter(isNotFalsy)
    .map(async ([file, filename]) => {
      await ffmpeg.writeFile(filename, new Uint8Array(await readFileAsArrayBuffer(file)));
      composer.addInput(filename);
    });

  if (inputs.length === 0) throw new Error("No video input");
  await Promise.all(inputs);

  if (inputs.length > 1) {
    spellBook.merge(composer, {
      sizes: {
        width: videoWidth,
        height: videoHeight,
      },
      directions: fromEntries(entries(files).map(([k, v]) => [k, !!v])),
    });
  }

  if (text) {
    const { content, style } = text;
    const sizes = {
      width: videoWidth,
      height: videoHeight,
      padding: {
        top: style.fontSize,
      },
    };
    if (typeof content === "string") {
      await addTextToVideo(ffmpeg, composer, sizes, content, style);
    } else if (content instanceof Date) {
      await addTimestampToVideo(ffmpeg, composer, sizes, content, style);
    }
  }

  if (trim?.startTime !== undefined && trim?.endTime !== undefined) {
    await trimVideo(ffmpeg, composer, trim.startTime, trim.endTime);
  }

  const lastTag = composer.filterChain.lastTag;
  if (lastTag) {
    composer.append("-map", `[${lastTag}]`);
  }
};

export const processVideo = createProcessJob(processVideoWork);
