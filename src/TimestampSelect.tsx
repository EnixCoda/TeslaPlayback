import { TeslaFS } from "./TeslaFS";
import { formatTimestamp } from "./utils";

export function TimestampSelect({
  options,
  value,
  onChange,
}: {
  options: TeslaFS.Timestamp[];
  value: TeslaFS.Timestamp | null;
  onChange: ReactSet<TeslaFS.Timestamp | null>;
}) {
  return (
    <ol>
      {options.map((option) => (
        <li key={option} aria-selected={value === option}>
          <button onClick={() => onChange(option)}>{formatTimestamp(option)}</button>
        </li>
      ))}
    </ol>
  );
}
