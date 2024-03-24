/* eslint-disable @typescript-eslint/no-explicit-any */
interface Pipe {
  (): void;
  <Args extends any[], R>(fn0: (...args: Args) => R): (...args: Args) => R;
  <Args extends any[], R0, R1>(fn0: (...args: Args) => R0, fn1: (...args: [R0]) => R1): (...args: Args) => R1;
  <Args extends any[], R0, R1, R2>(fn0: (...args: Args) => R0, fn1: (...args: [R0]) => R1, fn2: (...args: [R1]) => R2): (...args: Args) => R2;
}

export const pipe: Pipe =
  (...fns: any[]) =>
  (...args: any[]) =>
    args.reduce((acc, fn) => fn(acc), fns[0](...args));
