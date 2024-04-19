import { isNotFalsy } from "./general";

export class FFmpegArgsComposer {
  private args: string[] = [];
  filterChain: ComplexFilterChain = new ComplexFilterChain();

  append(key: string, value: string) {
    this.args.push(key, value);
    return this;
  }

  addInput(name: string) {
    this.append("-i", name);
    return this;
  }

  getArgs(output: string) {
    const filterString = this.filterChain.toString();
    return (filterString ? this.args.concat("-filter_complex", filterString) : this.args).concat(output);
  }
}

abstract class Stringifiable {
  abstract toString(): string;
}

export class ComplexFilterChainStep<Content extends Stringifiable = Stringifiable> extends Stringifiable {
  after: string | null = null;
  tag: string | null = null;
  constructor(public content: Content) {
    super();
  }

  setTag = (tag: ComplexFilterChainStep<Content>["tag"]) => {
    this.tag = tag;
    return this;
  };

  setAffix = (affix: ComplexFilterChainStep<Content>["after"]) => {
    this.after = affix;
    return this;
  };

  toString() {
    return [this.after && `[${this.after}]`, this.content, this.tag && `[${this.tag}]`].filter(Boolean).join(" ");
  }
}

class Tagger {
  private i = 0;

  iterateTag = () => {
    this.i += 1;
    return this.tag;
  };

  get tag() {
    return `tag${this.i}`;
  }
}

export class ComplexFilterChain extends Stringifiable {
  tagger = new Tagger();
  steps: ComplexFilterChainStep[] = [];

  append = (step: ComplexFilterChainStep) => {
    this.steps.push(step);
    return this;
  };

  toString() {
    return this.steps.map((step) => step.toString()).join(";");
  }
}

export type DrawTextOptions = {
  fontFile?: string;
  fontSize?: number;
  fontColor?: string;
  box?: boolean;
  boxColor?: string;
  x?: number;
  y?: number;
  baseTime?: string;
  timeFormat?: string;
};

export class DrawTextArgs {
  constructor(
    public text: string,
    public options: DrawTextOptions = {
      fontSize: 48,
      fontColor: "white",
      box: true,
      boxColor: "black",
      x: 10,
      y: 10,
    }
  ) {}

  setOptions(updater: (options: DrawTextArgs["options"]) => DrawTextArgs["options"]) {
    this.options = updater(this.options);
    return this;
  }

  setAsTimeStamp(baseTime: Date | number, format = "%Y-%m-%d %H\\:%M\\:%S") {
    this.options.baseTime = +baseTime + "000";
    this.options.timeFormat = format;
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
        baseTime && timeFormat ? ["text", `'${timeFormat}'`] : text && ["text", `'${text}'`], // TODO: escape `'`
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
