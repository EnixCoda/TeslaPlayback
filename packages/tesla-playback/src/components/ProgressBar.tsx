import React, { useRef } from "react";

export function ProgressBar({
  onChange,
  onDragStart,
  onDragEnd,
  value,
  native,
}: {
  value: number;
  onChange(progress: number): void;
  onDragStart?(): void;
  onDragEnd?(): void;
  native?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const draggingRef = useRef(false);
  return (
    <input
      onMouseDown={() => {
        if (draggingRef.current) return;
        draggingRef.current = true;
        onDragStart?.();
      }}
      onMouseUp={() => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        onDragEnd?.();
      }}
      onInput={(e) => onChange(parseFloat(e.currentTarget.value) / 100)}
      value={(value * 100).toFixed(2)}
      type="range"
      {...native}
    />
  );
}
