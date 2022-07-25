import { TeslaFS } from "./TeslaFS";

export function formatTimestamp(timestamp: TeslaFS.Timestamp) {
  const [date, time] = timestamp.split("_").map((part) => part.split("-"));
  return [date.join("-"), time.join(":")].join(" ");
}

export function formatHMS(seconds: number, forceRender: "h" | "m" = "m") {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return (forceRender === "h" || h > 0 ? [h, m, s] : forceRender === "m" || m > 0 ? [m, s] : [s]).map((x) => `${x}`.padStart(2, "0")).join(":");
}

export function run<R>(fn: () => R) {
  return fn();
}

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

export function getSortedKeys<T extends string, V>(eventGroup: {
  [key in T]: V;
}): T[] {
  return Object.keys(eventGroup).sort() as T[];
}
