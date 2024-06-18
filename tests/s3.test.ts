import { expect, test } from "bun:test";
import TranslationJob from "../src/jobs/translation";

test("Audio uploading", async () => {
  const res = await TranslationJob.uploadTranslatedAudio("https://s3.toil.cc/test.mp3", "test");
  expect(res).not.toEqual(null);
});
