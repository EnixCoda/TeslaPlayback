export function DropdownSelect<T extends string>({
  value,
  onChange,
  options,
  title,
}: {
  value: T;
  onChange: (value: T) => void;
  title?: string;
  options: {
    label: string;
    value: T;
  }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
          {title}
          {label}
        </option>
      ))}
    </select>
  );
}
