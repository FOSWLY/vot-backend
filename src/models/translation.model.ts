import Elysia, { t, Static } from "elysia";

import { availableLangs, availableTTS } from "@vot.js/shared/consts";

import { translatedServices } from "@/types/translation";

const FromLang = t.Union(availableLangs.map((lang) => t.Literal(lang)));
const ToLang = t.Union(availableTTS.map((lang) => t.Literal(lang)));
const TranslatedService = t.Union(translatedServices.map((service) => t.Literal(service)));

export const TranslationStatus = t.Union([
  t.Literal("success"),
  t.Literal("waiting"),
  t.Literal("parted"),
  t.Literal("failed"),
]);
export type TranslationStatus = Static<typeof TranslationStatus>;
export const TranslationProvider = t.Union([t.Literal("yandex")]);
export type TranslationProvider = Static<typeof TranslationProvider>;

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
    provider: TranslationProvider,
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
  "video-translation.mass-delete.body": t.Object({
    service: TranslatedService,
    status: t.Optional(TranslationStatus),
    provider: t.Optional(TranslationProvider),
    fromLang: t.Optional(FromLang),
    toLang: t.Optional(ToLang),
    created_before: t.Optional(t.Date()),
  }),
});
