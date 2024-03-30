import { useField } from "./useField";

export function useNumberField(
  defaultValue?: number,
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  } = {}
) {
  return useField({
    initialValue: defaultValue === undefined ? "" : `${defaultValue}`,
    parseRaw: (raw) => (raw ? parseInt(raw) : NaN),
    validate: (value) => (Number.isNaN(value) ? { type: "error", message: "Invalid number" } : null),
    process:
      min !== undefined || max !== undefined
        ? (value) => {
            if (min !== undefined && value < min) return min;
            if (max !== undefined && value > max) return max;
            return value;
          }
        : undefined,
  });
}
