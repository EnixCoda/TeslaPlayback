export async function loadFFMpeg() {
  return await (await import("./ffmpeg")).createFFMpeg();
}
