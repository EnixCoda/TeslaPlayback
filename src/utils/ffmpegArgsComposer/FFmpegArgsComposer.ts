import { ComplexFilterChain } from "./ComplexFilterChain";

export class FFmpegArgsComposer {
  private args: ([string] | [string, string])[] = [];
  filterChain: ComplexFilterChain = new ComplexFilterChain();

  append(key: string, value?: string) {
    if (value === undefined) this.args.push([key]);
    else this.args.push([key, value]);
    return this;
  }

  addInput(name: string) {
    this.append("-i", name);
    return this;
  }

  getArgs(): string[] {
    const filterString = this.filterChain.toString();
    const args = this.args;
    if (filterString) args.push(["-filter_complex", filterString]);

    return args.flat();
  }
}
