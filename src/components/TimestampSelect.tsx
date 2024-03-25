import { NavList, NavListProps } from "@primer/react";
import { TeslaFS } from "../TeslaFS";
import { CommonSelectProps } from "./Select";

export function TimestampSelect({
  options,
  value,
  onChange,
  renderOption = (option) => TeslaFS.formatTimestamp(option),
  ...rest
}: Omit<NonConflictJoin<CommonSelectProps<TeslaFS.Timestamp>, NavListProps>, "children">) {
  return (
    <NavList {...rest}>
      {options.map((option) => (
        <NavList.Item key={option} aria-current={value === option} onClick={() => onChange(option)} sx={{ whiteSpace: "nowrap", fontFamily: "mono" }}>
          {renderOption(option)}
        </NavList.Item>
      ))}
    </NavList>
  );
}
