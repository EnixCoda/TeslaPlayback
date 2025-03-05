import { Sizes } from "../exportVideo/spellBook";
import { isNotFalsy } from "../general";

export type DrawTextStyle = {
  fontFile?: string;
  fontSize: number;
  fontColor?: string;
  box?: boolean;
  boxColor?: string;
  x?: string | number;
  y?: string | number;
  baseTime?: string;
  timeFormat?: string;
};

type Alignment = "start" | "end" | "center";
const isAlignment = (value: unknown): value is Alignment =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ["start", "end", "center"].includes(value as any);

export class DrawTextArgs {
  constructor(
    public text: string,
    public options: DrawTextStyle = {
      fontSize: 48,
      fontColor: "white",
      box: true,
      boxColor: "black",
    }
  ) {}

  setOptions(updater: (options: DrawTextArgs["options"]) => DrawTextArgs["options"]) {
    this.options = updater(this.options);
    return this;
  }

  setAsTimeStamp(baseTime: Date | number, format = "%Y-%m-%d %H\\:%M\\:%S") {
    this.options.baseTime = `${+baseTime}`;
    this.options.timeFormat = format;
    return this;
  }

  setAlignment(size: Sizes, x?: Alignment | undefined, y?: Alignment | undefined) {
    if (x !== undefined && isAlignment(x)) this.options.x = `(${size.width}-text_w)/2`;
    if (y !== undefined && isAlignment(y)) this.options.y = `(${size.height}-text_h)/2`;
    return this;
  }

  toString() {
    const text = this.text;
    const { fontFile, fontSize, fontColor, box, boxColor, x, y, baseTime, timeFormat } = this.options;

    return (
      `drawtext=` +
      [
        baseTime && ["expansion", "strftime"],
        fontFile && ["fontfile", fontFile],
        fontSize && ["fontsize", fontSize],
        fontColor && ["fontcolor", fontColor],
        baseTime && timeFormat && ["basetime", +baseTime + "000"],
        baseTime && timeFormat ? ["text", `'${ffmpegEscape(timeFormat)}'`] : text && ["text", `'${ffmpegEscape(text)}'`],
        box && ["box", box ? 1 : 0],
        boxColor && ["boxcolor", boxColor],
        x && ["x", x],
        y && ["y", y],
      ]
        .filter(isNotFalsy)
        .map((pair) => pair.join("="))
        .join(":")
    );
  }
}

// https://ffmpeg.org/ffmpeg-utils.html#Quoting-and-escaping
const ffmpegEscape = (timeFormat: string) => timeFormat.replace(/([\\])/g, "\\\\\\\\").replace(/([':])/g, "'\\\\\\$1'");
