import { SubNav } from "@primer/react";
import { TeslaFS } from "../TeslaFS";

export function SubNavs({
  options,
  value,
  onChange,
}: {
  options: TeslaFS.ClipCategory[];
  value: TeslaFS.ClipCategory | null;
  onChange: (scope: TeslaFS.ClipCategory) => void;
}) {
  return (
    <SubNav>
      <SubNav.Links>
        {options.map((item) => (
          <SubNav.Link key={item} href="#" onClick={() => onChange(item)} selected={value === item}>
            {item}
          </SubNav.Link>
        ))}
      </SubNav.Links>
    </SubNav>
  );
}
