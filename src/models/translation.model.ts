import Elysia, { t, Static } from "elysia";

import { translatedServices } from "@/types/translation";
import { Navigation, NavigationParams } from "./core.model";
import { VideoId, TranslationProvider, TranslatedService, ToLang, FromLang } from "./shared.model";

export const TranslationStatus = t.Union(
  [t.Literal("success"), t.Literal("waiting"), t.Literal("parted"), t.Literal("failed")],
  {
    description: "Current status of translation",
    examples: ["success"],
  },
);
export type TranslationStatus = Static<typeof TranslationStatus>;

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

export const TranslateRequestBody = t.Object({
  // remove this object after some time
  service: TranslatedService,
  video_id: VideoId,
  from_lang: FromLang,
  to_lang: ToLang,
  raw_video: t.Optional(
    t.String({
      format: "uri",
      pattern: "^https://*",
      minLength: 12,
    }),
  ),
  provider: TranslationProvider,
});
export type TranslateRequestBody = Static<typeof TranslateRequestBody>;

export const TranslateResponseBodyFinished = t.Object({
  id: t.Number(),
  status: TranslationStatus,
  provider: TranslationProvider,
  translated_url: TranslatedUrl,
  message: Message,
  created_at: t.Date(),
});

export const TranslateResponseBodyWaiting = t.Object({
  status: t.Literal("waiting", {
    examples: ["waiting"],
  }),
  remaining_time: RemainingTime,
  message: Message,
});

export const TranslateResponseBody = t.Union([
  TranslateResponseBodyFinished,
  TranslateResponseBodyWaiting,
]);
export type TranslateResponseBody = Static<typeof TranslateResponseBody>;

export const videoTranslationModels = new Elysia().model({
  "video-translation.translate.body": TranslateRequestBody,
  "video-translation.translate.response": TranslateResponseBody,
  "video-translation.list.query": NavigationParams,
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
    from_lang: t.Optional(FromLang),
    to_lang: t.Optional(ToLang),
    created_before: t.Optional(t.Date()),
  }),
  "video-translation.mass-delete.response": t.Object({
    count: t.Number({
      examples: [42],
      description: "Count of deleted translations",
    }),
  }),
});
