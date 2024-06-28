import Elysia, { t } from "elysia";

const FromLang = t.TemplateLiteral("${auto|ru|en|zh|ko|lt|lv|ar|fr|it|es|de|ja}");
const ToLang = t.TemplateLiteral("${ru|en|kk}");

export const videoTranslationModels = new Elysia().model({
  "video-translation.translate": t.Object({
    service: t.TemplateLiteral("${mux|reddit|kodik}"),
    videoId: t.Union([t.String(), t.Number()]),
    fromLang: FromLang,
    toLang: ToLang,
    rawVideo: t.Optional(
      t.String({
        format: "uri",
        pattern: "^https://*",
        minLength: 12,
      }),
    ),
    provider: t.Literal("yandex"),
  }),
});
