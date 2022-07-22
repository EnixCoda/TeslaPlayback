import { CSSProperties, useMemo } from "react";

type LayoutMap<Key extends string> = Record<
  Key,
  {
    container: CSSProperties;
    children: CSSProperties[];
  }
>;

const layouts = {
  ["1/2/1"]: [
    [2, 0, 2, 2],
    [2, 2, 2, 2],
    [0, 1, 2, 2],
    [4, 1, 2, 2],
  ],
  ["2/2"]: [
    [0, 0, 1, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 1],
    [1, 1, 1, 1],
  ],
};

export type LayoutKey = keyof typeof layouts;
export const layoutKeys = Object.keys(layouts) as LayoutKey[];

function generateLayoutMaps<Key extends string>(raw: Record<Key, number[][]>, aspectRatio: number): LayoutMap<Key> {
  return Object.entries(raw).reduce((merged, [key, layout]) => {
    const [rows, cols] = layout.reduce(
      ([rows, cols], [col, row, width, height]) => [Math.max(rows, row + height), Math.max(cols, col + width)],
      [0, 0]
    );
    merged[key] = {
      container: {
        width: "100%",
        height: `${(100 * rows * aspectRatio) / cols}%`,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      },
      children: layout.map(([col, row, width, height]) => ({
        gridColumnStart: 1 + col,
        gridColumnEnd: 1 + col + width,
        gridRowStart: 1 + row,
        gridRowEnd: 1 + row + height,
      })),
    };
    return merged;
  }, {} as LayoutMap<Key>);
}

export function useVideosLayout(layout: LayoutKey, aspectRatio: number) {
  const layoutMaps = useMemo(() => generateLayoutMaps(layouts, aspectRatio), [aspectRatio]);
  return layoutMaps[layout];
}
