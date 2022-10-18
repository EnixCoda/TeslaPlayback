import { NavList } from "@primer/react";
import { ComponentProps } from "react";
import { TeslaFS } from "../TeslaFS";
import { formatTimestamp } from "../utils/general";

export function TimestampSelect({
  options,
  value,
  onChange,
  ...rest
}: {
  options: TeslaFS.Timestamp[];
  value: TeslaFS.Timestamp | null;
  onChange: ReactSet<TeslaFS.Timestamp | null>;
} & Pick<ComponentProps<typeof NavList>, "sx">) {
  return (
    <NavList {...rest}>
      {options.map((option) => (
        <NavList.Item key={option} aria-current={value === option} onClick={() => onChange(option)}>
          {formatTimestamp(option)}
        </NavList.Item>
      ))}
    </NavList>
  );
}
