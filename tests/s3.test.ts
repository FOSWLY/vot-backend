import { expect, test } from "bun:test";
import TranslationJob from "../src/jobs/translation";
import { generatePreSigned } from "../src/s3/save";

test("Audio uploading", async () => {
  const res = await TranslationJob.uploadTranslatedAudio("https://s3.toil.cc/test.mp3", "test");
  expect(res).not.toEqual(null);
});

test("Get pre signed", async () => {
  const res = await generatePreSigned("vtrans/reddit/1e4d582c-00c0-4353-8d83-d3f01d66bef8.mp3");
  console.log(res);
  expect(res).not.toEqual(null);
});
