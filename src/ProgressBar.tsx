export function ProgressBar({ onChange, value }: { value: number; onChange(progress: number): void }) {
  return <input onInput={(e) => onChange(parseFloat(e.currentTarget.value) / 100)} value={(value * 100).toFixed(2)} type="range" />;
}
