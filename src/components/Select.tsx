import { Select as PrimerSelect, SelectProps } from "@primer/react";
import { ReactNode } from "react";

export type CommonSelectProps<T extends string> = {
  options: T[];
  renderOption?: (option: T) => ReactNode;
} & IO<string | null>;

export function Select<T extends string>({
  options,
  value,
  onChange,
  renderOption = (option) => option,
  ...rest
}: NonConflictJoin<CommonSelectProps<T>, SelectProps>) {
  return (
    <PrimerSelect value={value ?? undefined} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((option) => (
        <PrimerSelect.Option key={option} aria-current={value === option} value={option}>
          {renderOption(option)}
        </PrimerSelect.Option>
      ))}
    </PrimerSelect>
  );
}
