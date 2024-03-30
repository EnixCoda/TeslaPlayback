import { Select as PrimerSelect, SelectProps } from "@primer/react";
import { ReactNode } from "react";

export type CommonSelectProps<T extends string> = {
  options: T[] | Option<T>[];
  renderOption?: (option: T | Option<T>) => ReactNode;
} & IO<T, T | null>;

export function Select<T extends string>({
  options,
  value,
  onChange,
  renderOption = (option) => (typeof option === "string" ? option : option.label),
  ...rest
}: NonConflictJoin<CommonSelectProps<T>, SelectProps>) {
  return (
    <PrimerSelect value={value ?? undefined} onChange={(e) => onChange(e.target.value as T)} {...rest}>
      {options.map((option) => (
        <PrimerSelect.Option
          key={typeof option === "string" ? option : option.value}
          aria-current={value === option}
          value={typeof option === "string" ? option : option.value}
        >
          {renderOption(option)}
        </PrimerSelect.Option>
      ))}
    </PrimerSelect>
  );
}
