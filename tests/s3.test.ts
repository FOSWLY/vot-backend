import { expect, test } from "bun:test";
import TranslationJob from "../src/jobs/translation";
import { generatePreSigned } from "../src/s3/save";

test("Audio uploading", async () => {
  const res = await TranslationJob.uploadTranslatedAudio("https://s3.toil.cc/test.mp3", "test");
  expect(res).not.toEqual(null);
});

test("Get pre signed", async () => {
  const res = await generatePreSigned("vtrans/test/ae9b4d2f-abb2-421a-b2b3-4caf8fd0ed5f.mp3");
  console.log(res);
  expect(res).not.toEqual(null);
});
