import React from "react";

export function ProgressBar({
  onChange,
  value,
  native,
}: {
  value: number;
  onChange(progress: number): void;
  native?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return <input onInput={(e) => onChange(parseFloat(e.currentTarget.value) / 100)} value={(value * 100).toFixed(2)} type="range" {...native} />;
}
