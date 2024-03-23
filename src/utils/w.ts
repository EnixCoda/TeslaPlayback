export const w =
  <T>(t: T) =>
  <R>(f: (t: T) => R) =>
    f(t);
