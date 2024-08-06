import Elysia, { t } from "elysia";

import { availableLangs, availableTTS } from "vot.js/consts";
import { translatedServices } from "../types/translation";

const FromLang = t.TemplateLiteral(`\${${availableLangs.join("|")}}`);
const ToLang = t.TemplateLiteral(`\${${availableTTS.join("|")}}`);

export const videoTranslationModels = new Elysia().model({
  "video-translation.translate": t.Object({
    service: t.TemplateLiteral(`\${${translatedServices.join("|")}}`),
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
  "video-translation.delete-translate": t.Object({
    id: t.Number(),
  }),
});
