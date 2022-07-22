import { TeslaFS } from "./TeslaFS";

export function ClipScopeSelect({ value, onChange }: { value: TeslaFS.ClipScope; onChange: ReactSet<TeslaFS.ClipScope> }) {
  return (
    <ul>
      {TeslaFS.clipScopes.map((item) => (
        <li onClick={() => onChange(item)} key={item} aria-selected={value === item}>
          {item}
        </li>
      ))}
    </ul>
  );
}
