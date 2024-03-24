import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

// do NOT import this file directly, checkout './ffmpeg.entry.ts' instead
export async function createFFMpeg() {
  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => {
    console.log("[ffmpeg]", message);
  });

  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
    classWorkerURL: new URL("../../node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js", import.meta.url).toString(),
  });

  return ffmpeg;
}
