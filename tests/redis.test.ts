import { expect, test } from "bun:test";
import TranslationRepository from "../src/cache/repositories/translation";

test("set translation", async () => {
  const res = await new TranslationRepository().create({
    id: 1,
    service: "reddit",
    video_id: "test",
    status: "success",
    provider: "yandex",
    lang_from: "en",
    lang_to: "ru",
    message: null,
    remaining_time: null,
    translated_url: null,
    created_at: new Date(),
  });
  console.log(res);
  expect(res).not.toEqual(null);
});

test("Get translation", async () => {
  const res = await new TranslationRepository().get({
    service: "reddit",
    video_id: "test",
    provider: "yandex",
    lang_from: "en",
    lang_to: "ru",
  });
  console.log(res);
  expect(res).not.toEqual(null);
});

test("Get translations", async () => {
  const res = await new TranslationRepository().getAll({
    service: "reddit",
    video_id: "test",
  });
  console.log(res);
  expect(res).not.toEqual(null);
});

test("update translation", async () => {
  await new TranslationRepository().update(
    {
      service: "reddit",
      video_id: "test",
      provider: "yandex",
      lang_from: "en",
      lang_to: "ru",
    },
    {
      status: "failed",
    },
  );
});
