import * as React from "react";

export function LayoutComposer({
  children,
  decorator,
  style,
}: {
  children: React.ReactElement | Iterable<React.ReactElement>;
  decorator: (index: number, element: React.ReactElement) => React.ReactElement;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", position: "relative", transition: ".25s linear all", ...style }}>
      {React.Children.map(React.Children.toArray(children), (child, index) =>
        React.isValidElement(child) && child.key !== null ? decorator(index, child) : child
      )}
    </div>
  );
}
