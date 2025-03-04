import React from "react";

type DecoratableReactElement = React.ReactElement<{
  style?: React.CSSProperties;
}>;

export function LayoutComposer({
  children,
  decorator,
  style,
}: {
  children: DecoratableReactElement | Iterable<DecoratableReactElement>;
  decorator: (index: number, element: DecoratableReactElement) => DecoratableReactElement;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", position: "relative", ...style }}>
      {React.Children.map(React.Children.toArray(children) as Array<DecoratableReactElement>, (child, index) =>
        React.isValidElement(child) && child.key !== null ? decorator(index, child) : child
      )}
    </div>
  );
}
