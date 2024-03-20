import { ActionList, ActionMenu } from "@primer/react";
import { ReactNode } from "react";

export function DropdownSelect<T extends string>({
  value,
  onChange,
  options,
  title,
}: {
  value: T;
  onChange: (value: T) => void;
  title?: ReactNode;
  options: {
    label: string;
    value: T;
  }[];
}) {
  return (
    <ActionMenu>
      <ActionMenu.Button>{title}</ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single">
          {options.map(({ label, value: optionValue }) => (
            <ActionList.Item key={optionValue} selected={optionValue === value} onSelect={() => onChange(optionValue)}>
              {label}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}
