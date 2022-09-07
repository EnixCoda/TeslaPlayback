import { NavList } from "@primer/react";
import { TeslaFS } from "../TeslaFS";
import { formatTimestamp } from "../utils/general";

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
    <NavList>
      {options.map((option) => (
        <NavList.Item key={option} aria-current={value === option} onClick={() => onChange(option)}>
          {formatTimestamp(option)}
        </NavList.Item>
      ))}
    </NavList>
  );
}
