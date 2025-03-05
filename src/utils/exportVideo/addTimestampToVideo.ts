import { ProcessWork } from ".";
import { DrawTextStyle } from "../ffmpegArgsComposer/DrawTextArgs";
import { filenames } from "./filenames";
import { loadFontFile } from "./loadFontFile";
import { Sizes, spellBook } from "./spellBook";

export const addTimestampToVideo: ProcessWork<[sizes: Sizes, baseTime: Date, textOptions: DrawTextStyle]> = async (
  ffmpeg,
  composer,
  sizes,
  baseTime,
  textOptions
) => {
  await ffmpeg.writeFile(filenames.font, await loadFontFile());
  spellBook.addTimestamp(composer, sizes, baseTime, textOptions);
};
