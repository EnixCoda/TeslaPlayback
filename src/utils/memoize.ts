// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoize = <Args extends any[], R>(
  fn: (...args: Args) => R,
  checkCacheStale?: (args: Args, lastArgs: Args | null) => boolean
): ((...args: Args) => R) => {
  let last: {
    args: Args;
    result: R;
  } | null = null;
  return (...args) => {
    if (last === null || checkCacheStale?.(args, last.args)) {
      const result = fn(...args);
      last = {
        args,
        result,
      };
    }
    return last.result;
  };
};
