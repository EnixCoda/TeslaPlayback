import { Directions } from "../../common";
import { filenames } from "./filenames";
import { FFmpegArgsComposer } from "../ffmpegArgsComposer/FFmpegArgsComposer";
import { ComplexFilterChainStep } from "../ffmpegArgsComposer/ComplexFilterChain";
import { DrawTextStyle, DrawTextArgs } from "../ffmpegArgsComposer/DrawTextArgs";
import { formatHHMMSS, isNotFalsy } from "../general";

const internalTags = {
  nthVideo: (n: number) => `${n}:v`,
  nthAudio: (n: number) => `${n}:a`,
};

const merge = (
  composer: FFmpegArgsComposer,
  {
    sizes: { width: w, height: h },
    directions,
  }: {
    sizes: Sizes;
    directions: Record<Directions, boolean>;
  }
) => {
  const chain = composer.filterChain;

  const scaledTags = [directions.front, directions.rear, directions.left, directions.right].filter(isNotFalsy).map((_, i) => {
    chain.append(new ComplexFilterChainStep(`setpts=PTS-STARTPTS, scale=${w / 2}*${h / 2}`).addInputTag(internalTags.nthVideo(i)));
    return chain.lastTag;
  });

  chain.append(new ComplexFilterChainStep(`nullsrc=size=${w}*${h}`));
  const gridSize = {
    width: 2,
    height: 2,
  };
  let count = 0;
  for (let i = 0; i < gridSize.height; i++) {
    for (let j = 0; j < gridSize.height; j++) {
      if (count++ >= scaledTags.length) break;

      chain.append(
        new ComplexFilterChainStep(`overlay=shortest=1:x=${(w / 2) * i}:y=${(h / 2) * j}`)
          .addInputTag(chain.lastTag)
          .addInputTag(scaledTags[count - 1])
      );
    }
  }
};

export type Sizes = {
  width: number;
  height: number;
  padding?: Partial<Record<"top" | "bottom" | "left" | "right", number>>;
};

const padVideo = (composer: FFmpegArgsComposer, sizes: Sizes) => {
  const chain = composer.filterChain;
  const lastTag = chain.lastTag;

  const { width, height } = sizes;
  const { left = 0, right = 0, top = 0, bottom = 0 } = sizes.padding ?? {};

  const totalWidth = width + left + right;
  const totalHeight = height + top + bottom;
  chain.append(new ComplexFilterChainStep(`color=c=black:s=${totalWidth}x${totalHeight}`));

  const paddingX = left + right;
  const paddingY = top + bottom;
  chain.append(new ComplexFilterChainStep(`overlay=${paddingX}:${paddingY}`).addInputTag(chain.lastTag).addInputTag(lastTag));
};

const addText = (composer: FFmpegArgsComposer, sizes: Sizes, text: string, textOptions: DrawTextStyle) => {
  padVideo(composer, sizes);

  const chain = composer.filterChain;
  const lastTag = chain.lastTag;
  chain.append(
    new ComplexFilterChainStep(
      new DrawTextArgs(text, {
        ...textOptions,
        fontFile: filenames.font,
      }).setAlignment({ width: sizes.width, height: textOptions.fontSize }, "center", "center")
    ).addInputTag(lastTag)
  );
};

const addTimestamp = (composer: FFmpegArgsComposer, sizes: Sizes, baseTime: Date, textOptions: DrawTextStyle) => {
  padVideo(composer, sizes);

  const chain = composer.filterChain;
  const lastTag = chain.lastTag;
  chain.append(
    new ComplexFilterChainStep(
      new DrawTextArgs("", {
        ...textOptions,
        fontFile: filenames.font,
      })
        .setAsTimeStamp(baseTime)
        .setAlignment({ width: sizes.width, height: textOptions.fontSize }, "center", "center")
    ).addInputTag(lastTag)
  );
};

const trim = (composer: FFmpegArgsComposer, startTime: number, endTime: number) => {
  composer.append(`-ss`, formatHHMMSS(startTime));
  composer.append(`-t`, formatHHMMSS(endTime - startTime));
};

export const spellBook = {
  merge,
  addText,
  addTimestamp,
  trim,
};
