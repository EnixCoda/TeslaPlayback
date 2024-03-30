import { useMemo, useState } from "react";

export function useField<V>({
  initialValue = null,
  parseRaw,
  validate,
  process = (_) => _,
}: {
  initialValue?: string | null;
  parseRaw?: (raw: string | null) => V;
  validate?: (value: V) => Validation | null;
  process?: (value: V) => V;
}) {
  const [raw, setRaw] = useState(initialValue);
  const value: V = useMemo(() => process(parseRaw ? parseRaw(raw) : (raw as V)), [raw]);
  const validation = useMemo(() => (validate ? validate(value) : null), [value, validate]);

  return {
    raw,
    setRaw,
    value,
    validation,
  };
}
type Validation =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "success";
      message: string;
    };
