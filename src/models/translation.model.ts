import Elysia, { t } from "elysia";

import { availableLangs, availableTTS } from "vot.js/consts";
import { translatedServices } from "../types/translation";

const FromLang = t.Union(availableLangs.map((lang) => t.Literal(lang)));
const ToLang = t.Union(availableTTS.map((lang) => t.Literal(lang)));
const TranslatedService = t.Union(translatedServices.map((service) => t.Literal(service)));

export const videoTranslationModels = new Elysia().model({
  "video-translation.translate": t.Object({
    service: TranslatedService,
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
  "video-translation.list": t.Object({
    // min/max validation for number doesn't work (???)
    page: t.Optional(t.Number()),
    limit: t.Optional(t.Number()),
  }),
  "video-translation.get-translate-by-id": t.Object({
    id: t.Number(),
  }),
  "video-translation.delete-translate": t.Object({
    id: t.Number(),
  }),
});
