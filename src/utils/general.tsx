import { TeslaFS } from "../TeslaFS";

export function formatTimestamp(timestamp: TeslaFS.Timestamp) {
  const [date, time] = timestamp.split("_").map((part) => part.split("-"));
  return [date.join("-"), time.join(":")].join(" ");
}

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
