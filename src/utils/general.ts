export function formatHMS(seconds: number, forceRender: "h" | "m" = "m") {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return (forceRender === "h" || h > 0 ? [h, m, s] : forceRender === "m" || m > 0 ? [m, s] : [s]).map((x) => `${x}`.padStart(2, "0")).join(":");
}

export function run<R>(fn: () => R) {
  return fn();
}

export function getSortedKeys<T extends string, V>(eventGroup: {
  [key in T]: V;
}): T[] {
  return Object.keys(eventGroup).sort() as T[];
}

export const downloadURL = (data: string, fileName: string) => {
  const a = document.createElement("a");
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style.display = "none";
  a.click();
  a.remove();
};

export const getBlob = (data: Uint8Array, mimeType: string): Blob =>
  new Blob([data], {
    type: mimeType,
  });

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);

  downloadURL(url, fileName);

  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

export function readFileAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("loadend", () => {
      const { result } = reader;
      if (result instanceof ArrayBuffer) return resolve(result);
      console.error(`Unexpected loaded data type`, result);
      reject();
    });
    reader.addEventListener("error", reject);
    reader.readAsArrayBuffer(file);
  });
}

export function dataURLtoFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);

  return new File([u8arr], filename, { type: mime });
}

export function formatDateTime(dateTime: Date) {
  // YYYY-mm-DD HH:MM:SS
  return dateTime
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d+Z$/, "");
}

export function formatHHMMSS(seconds: number) {
  // HH:MM:SS
  const h = Math.floor(seconds / 60 / 60);
  const m = Math.floor(seconds / 60) % 60;
  const s = seconds % 60;
  return [h, m, s].map((x) => x.toString().padStart(2, "0")).join(":");
}

export function shiftTime(time: Date, shift: number) {
  return new Date(shift * 1000 + time.getTime());
}

export const entries = <K extends string | number | symbol, V>(obj: Record<K, V> | Partial<Record<K, V>>) => Object.entries(obj) as [K, V][];

export const fromEntries = <K extends string | number | symbol, V>(entries: [K, V][]) => Object.fromEntries(entries) as Record<K, V>;

export const isNotFalsy = <T>(item: T | false | 0 | null | undefined | ""): item is T => !!item;
