import { vi, expect, test } from "vitest";
import { getArgs, processVideoWork } from "..";

vi.mock("@/utils/exportVideo/loadFontFile.ts", () => ({
  loadFontFile() {
    return new File([], "");
  },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ffmpeg: any = {
  writeFile: vi.fn(),
};

test("should return the correct args for draw text with alignment", async () => {
  expect(
    await getArgs(processVideoWork, ffmpeg, [
      { front: new File([], "front.mp4") },
      {
        text: {
          content: "hello",
          style: {
            fontSize: 10,
          },
        },
      },
    ])
  ).toEqual([
    "-i",
    "input_front.mp4",
    "-map",
    "[tag3]",
    "output.mp4",
    "-filter_complex",
    `color=c=black:s=1280x970 [tag1];
[tag1][0:v] overlay=0:10 [tag2];
[tag2] drawtext=fontfile=font.ttf:fontsize=10:text='hello':x=(1280-text_w)/2:y=(10-text_h)/2 [tag3]`,
  ]);
});

test("should return the correct args for single input", async () => {
  const args = await getArgs(processVideoWork, ffmpeg, [{ front: new File([], "front.mp4") }, {}]);

  expect(args).toEqual(["-i", "input_front.mp4", "-map", "[0:v]", "output.mp4"]);
});

test("should return the correct args for 2 inputs", async () => {
  const args = await getArgs(processVideoWork, ffmpeg, [{ front: new File([], "front.mp4"), rear: new File([], "rear.mp4") }, {}]);

  expect(args).toEqual([
    "-i",
    "input_front.mp4",
    "-i",
    "input_rear.mp4",
    "-map",
    "[tag5]",
    "output.mp4",
    "-filter_complex",
    `[0:v] setpts=PTS-STARTPTS, scale=640*480 [tag1];
[1:v] setpts=PTS-STARTPTS, scale=640*480 [tag2];
nullsrc=size=1280*960 [tag3];
[tag3][tag1] overlay=shortest=1:x=0:y=0 [tag4];
[tag4][tag2] overlay=shortest=1:x=0:y=480 [tag5]`,
  ]);
});

test("should return the correct args for 4 inputs", async () => {
  const args = await getArgs(processVideoWork, ffmpeg, [
    {
      front: new File([], "front.mp4"),
      rear: new File([], "rear.mp4"),
      left: new File([], "left.mp4"),
      right: new File([], "right.mp4"),
    },
    {},
  ]);

  expect(args).toEqual([
    "-i",
    "input_front.mp4",
    "-i",
    "input_left.mp4",
    "-i",
    "input_right.mp4",
    "-i",
    "input_rear.mp4",
    "-map",
    "[tag9]",
    "output.mp4",
    "-filter_complex",
    `[0:v] setpts=PTS-STARTPTS, scale=640*480 [tag1];
[1:v] setpts=PTS-STARTPTS, scale=640*480 [tag2];
[2:v] setpts=PTS-STARTPTS, scale=640*480 [tag3];
[3:v] setpts=PTS-STARTPTS, scale=640*480 [tag4];
nullsrc=size=1280*960 [tag5];
[tag5][tag1] overlay=shortest=1:x=0:y=0 [tag6];
[tag6][tag2] overlay=shortest=1:x=0:y=480 [tag7];
[tag7][tag3] overlay=shortest=1:x=640:y=0 [tag8];
[tag8][tag4] overlay=shortest=1:x=640:y=480 [tag9]`,
  ]);
});
