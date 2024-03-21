export function assert<T>(target: T | null | undefined, message: string): asserts target is T {
  if (target === null || target === undefined) throw new Error(message);
}

export function withAssertion<T>(target: T | null | undefined, message: string): T {
  assert(target, message);
  return target;
}
