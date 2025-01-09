import Elysia, { t, Static } from "elysia";

import { availableLangs, availableTTS } from "@vot.js/shared/consts";

import { translatedServices } from "@/types/translation";
import { Navigation } from "./core.model";
import { StringsToLiterals } from "@/libs/utils";

export const FromLang = t.Union(StringsToLiterals(availableLangs));
export type FromLang = Static<typeof FromLang>;

export const ToLang = t.Union(StringsToLiterals(availableTTS));
export type ToLang = Static<typeof ToLang>;

export const TranslatedService = t.Union(StringsToLiterals(translatedServices));
export type TranslatedService = Static<typeof TranslatedService>;

export const TranslationStatus = t.Union(
  [t.Literal("success"), t.Literal("waiting"), t.Literal("parted"), t.Literal("failed")],
  {
    description: "Current status of translation",
    examples: ["success"],
  },
);
export type TranslationStatus = Static<typeof TranslationStatus>;

export const TranslationProvider = t.Union([t.Literal("yandex")], {
  description: "The provider that makes the translate",
  examples: ["yandex"],
});
export type TranslationProvider = Static<typeof TranslationProvider>;

export const VideoId = t.Union([t.String(), t.Number()]);
export type VideoId = Static<typeof VideoId>;

export const Message = t.Nullable(
  t.String({
    description: "Error message",
  }),
);

export const RemainingTime = t.Nullable(
  t.Number({
    description: "Remaining time until the completion of the translate task",
    examples: [67],
  }),
);

export const TranslatedUrl = t.Nullable(
  t.String({
    description: "Link to translation audio file",
  }),
);

export const Translation = t.Object({
  id: t.Number(),
  service: t.String({
    description: "Service for which the translate was made",
    examples: [translatedServices[0]],
  }),
  video_id: VideoId,
  status: TranslationStatus,
  provider: TranslationProvider,
  lang_from: t.String({
    description: "Source language",
    examples: ["en"],
  }),
  lang_to: t.String({
    description: "Target language",
    examples: ["ru"],
  }),
  message: Message,
  remaining_time: RemainingTime,
  translated_url: TranslatedUrl,
  created_at: t.Date(),
});

export const videoTranslationModels = new Elysia().model({
  "video-translation.translate.body": t.Object({
    service: TranslatedService,
    videoId: VideoId,
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
  "video-translation.translate.response": t.Union([
    t.Object({
      id: t.Number(),
      status: TranslationStatus,
      provider: TranslationProvider,
      translatedUrl: TranslatedUrl,
      message: Message,
      createdAt: t.Date(),
    }),
    t.Object({
      status: t.Literal("waiting", {
        examples: ["waiting"],
      }),
      remainingTime: RemainingTime,
      message: Message,
    }),
  ]),
  "video-translation.list.query": t.Object({
    // min/max validation for number doesn't work (???)
    page: t.Optional(t.Number()),
    limit: t.Optional(t.Number()),
  }),
  "video-translation.list.response": t.Object({
    translations: t.Array(Translation),
    navigation: Navigation,
  }),
  "video-translation.not-found": t.Object({
    error: t.Literal("The requested translation wasn't found!", {
      examples: ["The requested translation wasn't found!"],
    }),
  }),
  "video-translation.get-translate-by-id.params": t.Object({
    id: t.Number(),
  }),
  "video-translation.get-translate-by-id.response": Translation,
  "video-translation.delete-translate.params": t.Object({
    id: t.Number(),
  }),
  "video-translation.delete-translate.response": Translation,
  "video-translation.mass-delete.body": t.Object({
    service: TranslatedService,
    status: t.Optional(TranslationStatus),
    provider: t.Optional(TranslationProvider),
    fromLang: t.Optional(FromLang),
    toLang: t.Optional(ToLang),
    created_before: t.Optional(t.Date()),
  }),
  "video-translation.mass-delete.response": t.Object({
    count: t.Number({
      examples: [42],
      description: "Count of deleted translations",
    }),
  }),
});
