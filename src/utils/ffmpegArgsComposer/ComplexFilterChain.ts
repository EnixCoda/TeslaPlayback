import { isNotFalsy } from "../general";

abstract class Stringifiable {
  abstract toString(): string;
}

export class ComplexFilterChainStep<Content extends Stringifiable = Stringifiable> extends Stringifiable {
  inputs: string[] = [];
  tag: string | null = null;
  constructor(public content: Content) {
    super();
  }

  setTag = (tag: ComplexFilterChainStep<Content>["tag"]) => {
    this.tag = tag;
    return this;
  };

  addInputTag = (affix: ComplexFilterChainStep<Content>["inputs"][number]) => {
    this.inputs.push(affix);
    return this;
  };

  toString() {
    return [this.inputs.map((x) => `[${x}]`).join(""), this.content, this.tag && `[${this.tag}]`].filter(isNotFalsy).join(" ");
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
    this.tagLast();
    return this;
  };

  tagLast = (tag?: string) => {
    const lastStep = this.steps.at(-1);
    if (lastStep && !lastStep?.tag) {
      lastStep.setTag(tag ?? this.tagger.iterateTag());
    }
    return this;
  };

  toString() {
    return this.steps.map((step) => step.toString()).join(";\n");
  }

  get lastTag() {
    return this.steps.at(-1)?.tag ?? `0:v`;
  }
}
