import { ProcessWork } from ".";
import { spellBook } from "./spellBook";

export const trimVideo: ProcessWork<[startTimeInSecond: number, endTimeInSecond: number]> = async (_, composer, startTime, endTime) => {
  spellBook.trim(composer, startTime, endTime);
};
