import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import fontArial from "../assets/fonts/Arial.ttf?url";
import { Directions, directions } from "../common";
import { ComplexFilterChainStep, DrawTextArgs, DrawTextOptions, FFmpegArgsComposer } from "./FFmpegArgsComposer";
import { entries, formatHHMMSS, fromEntries, readFileAsArrayBuffer } from "./general";
import { memoize } from "./memoize";

const filenames = {
  input: "input.mp4",
  front: "input_front.mp4",
  rear: "input_rear.mp4",
  left: "input_left.mp4",
  right: "input_right.mp4",
  output: "output.mp4",
  font: "font.ttf",
};

const spellBook = {
  merge: (
    composer: FFmpegArgsComposer,
    {
      width: w = 1280,
      height: h = 960,
      directions = {
        front: true,
        rear: true,
        left: true,
        right: true,
      },
    }: {
      width?: number;
      height?: number;
      directions?: Record<Directions, boolean>;
    }
  ) => {
    if (directions.front) composer.addInput(filenames.front);
    if (directions.rear) composer.addInput(filenames.rear);
    if (directions.left) composer.addInput(filenames.left);
    if (directions.right) composer.addInput(filenames.right);

    const chain = composer.filterChain;
    chain.append(new ComplexFilterChainStep(`nullsrc=size=${w * 2}*${h * 2}`));

    if (directions.front) {
      const layer = `upperLeft`;
      const lastTag = chain.tagger.iterateTag();
      chain.steps.at(-1)?.setTag(lastTag);
      chain.append(new ComplexFilterChainStep(`[0:v] setpts=PTS-STARTPTS, scale=${w}*${h}`).setTag(layer));
      chain.append(new ComplexFilterChainStep(`[${layer}] overlay=shortest=1:x=0:y=0`).setAffix(lastTag));
    }
    if (directions.rear) {
      const layer = `upperRight`;
      const lastTag = chain.tagger.iterateTag();
      chain.steps.at(-1)?.setTag(lastTag);
      chain.append(new ComplexFilterChainStep(`[1:v] setpts=PTS-STARTPTS, scale=${w}*${h}`).setTag(layer));
      chain.append(new ComplexFilterChainStep(`[${layer}] overlay=shortest=1:x=${w}:y=0`).setAffix(lastTag));
    }
    if (directions.left) {
      const layer = `lowerLeft`;
      const lastTag = chain.tagger.iterateTag();
      chain.steps.at(-1)?.setTag(lastTag);
      chain.append(new ComplexFilterChainStep(`[2:v] setpts=PTS-STARTPTS, scale=${w}*${h}`).setTag(layer));
      chain.append(new ComplexFilterChainStep(`[${layer}] overlay=shortest=1:x=0:y=${h}`).setAffix(lastTag));
    }
    if (directions.right) {
      const layer = `lowerRight`;
      const lastTag = chain.tagger.iterateTag();
      chain.steps.at(-1)?.setTag(lastTag);
      chain.append(new ComplexFilterChainStep(`[3:v] setpts=PTS-STARTPTS, scale=${w}*${h}`).setTag(layer));
      chain.append(new ComplexFilterChainStep(`[${layer}] overlay=shortest=1:x=${w}:y=${h}`).setAffix(lastTag));
    }
  },
  drawText: (composer: FFmpegArgsComposer, text: string, textOptions?: DrawTextOptions) => {
    const chain = composer.filterChain;
    const lastStep = chain.steps.at(-1);

    chain.append(
      new ComplexFilterChainStep(
        new DrawTextArgs(text, {
          ...textOptions,
          fontFile: filenames.font,
        })
      )
    );

    if (lastStep) {
      const lastTag = chain.tagger.tag ? chain.tagger.iterateTag() : "[0:v]";
      lastStep.setTag(lastTag);
      chain.steps.at(-1)?.setAffix(lastTag);
    }
  },
  addTimestamp: (composer: FFmpegArgsComposer, baseTime: Date, textOptions?: DrawTextOptions) => {
    const chain = composer.filterChain;
    const lastStep = chain.steps.at(-1);

    chain.append(
      new ComplexFilterChainStep(
        new DrawTextArgs("", {
          ...textOptions,
          fontFile: filenames.font,
        }).setAsTimeStamp(baseTime)
      )
    );

    if (lastStep) {
      const lastTag = chain.tagger.tag ? chain.tagger.iterateTag() : "[0:v]";
      lastStep.setTag(lastTag);
      chain.steps.at(-1)?.setAffix(lastTag);
    }
  },
  trim: (composer: FFmpegArgsComposer, startTime: number, endTime: number) => {
    composer.append(`-ss`, formatHHMMSS(startTime));
    composer.append(`-t`, formatHHMMSS(endTime - startTime));
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VideoProcessJob<Args extends any[]> = (ffmpeg: FFmpeg, ...args: Args) => ReturnType<FFmpeg["readFile"]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ProcessWork<Args extends any[]> {
  (ffmpeg: FFmpeg | null, composer: FFmpegArgsComposer, ...args: Args): Promise<void> | void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getArgs<Args extends any[]>(composeArgs: ProcessWork<Args>, ffmpeg: FFmpeg | null, args: Args) {
  const composer = new FFmpegArgsComposer();
  await composeArgs(ffmpeg, composer, ...args);
  const ffmpegArgs = composer.getArgs(filenames.output);
  console.log("ffmpegArgs", ffmpegArgs);
  return ffmpegArgs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProcessJob: <Args extends any[]>(work: ProcessWork<Args>) => VideoProcessJob<Args> =
  (work) =>
  async (ffmpeg, ...args) => {
    await ffmpeg.exec(await getArgs(work, ffmpeg, args));
    return await ffmpeg.readFile(filenames.output);
  };

export const processVideoWork: ProcessWork<
  [
    Partial<Record<Directions, File | undefined>>,
    {
      textToDraw?: string | Date;
      textStyle?: DrawTextOptions;
      trim?: { startTime?: number; endTime?: number };
    }
  ]
> = async (ffmpeg, composer, files, { textToDraw, textStyle, trim }): Promise<void> => {
  let count = 0;
  for (const direction of directions) {
    const file = files[direction];
    if (file) {
      count += 1;
      await ffmpeg?.writeFile(filenames[direction], new Uint8Array(await readFileAsArrayBuffer(file)));
      composer.addInput(filenames[direction]);
    }
  }

  if (count === 0) throw new Error("No video input");

  if (count > 1) {
    spellBook.merge(composer, {
      directions: fromEntries(entries(files).map(([k, v]) => [k, !!v])),
    });
  }

  if (typeof textToDraw === "string") {
    await drawTextToVideo(ffmpeg, composer, textToDraw, textStyle);
  } else if (textToDraw instanceof Date) {
    await addTimestampToVideo(ffmpeg, composer, textToDraw, textStyle);
  }

  if (trim?.startTime !== undefined && trim?.endTime !== undefined) {
    await trimVideo(ffmpeg, composer, trim.startTime, trim.endTime);
  }
};
export const processVideo = createProcessJob(processVideoWork);

const drawTextToVideo: ProcessWork<[text: string, textOptions: DrawTextOptions | undefined]> = async (ffmpeg, composer, text, textOptions) => {
  await ffmpeg?.writeFile(filenames.font, await loadFontFile());
  spellBook.drawText(composer, text, textOptions);
};

const addTimestampToVideo: ProcessWork<[baseTime: Date, textOptions: DrawTextOptions | undefined]> = async (
  ffmpeg,
  composer,
  baseTime,
  textOptions
) => {
  ffmpeg && (await ffmpeg.writeFile(filenames.font, await loadFontFile()));
  spellBook.addTimestamp(composer, baseTime, textOptions);
};

const trimVideo: ProcessWork<[startTimeInSecond: number, endTimeInSecond: number]> = async (_, composer, startTime, endTime) => {
  spellBook.trim(composer, startTime, endTime);
};

const loadFontFile = memoize(async function loadFontFile() {
  return await fetchFile(new URL(fontArial, import.meta.url).toString());
});
