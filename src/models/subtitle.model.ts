import Elysia, { t } from "elysia";

import { translatedServices } from "@/types/translation";
import { Navigation, NavigationParams } from "./core.model";
import { VideoId, TranslationProvider, TranslatedService, FromLang } from "./shared.model";

export const SubtitleUrl = t.Nullable(
  t.String({
    description: "Link to subtitle file",
  }),
);

export const Subtitle = t.Object({
  id: t.Number(),
  service: t.String({
    description: "Service for which the subtitle was made",
    examples: [translatedServices[0]],
  }),
  video_id: VideoId,
  provider: TranslationProvider,
  lang: t.String({
    description: "Subtitle language",
    examples: ["ru"],
  }),
  lang_from: t.Nullable(
    t.String({
      description: "Subtitle source language",
      examples: ["en"],
    }),
  ),
  subtitle_url: SubtitleUrl,
  created_at: t.Date(),
});

export const videoSubtitleModels = new Elysia().model({
  "video-subtitles.get-subtitle.body": t.Object({
    service: TranslatedService,
    video_id: VideoId,
    provider: TranslationProvider,
  }),
  "video-subtitles.get-subtitle.response": t.Array(Subtitle),
  "video-subtitles.list.query": NavigationParams,
  "video-subtitles.list.response": t.Object({
    subtitles: t.Array(Subtitle),
    navigation: Navigation,
  }),
  "video-subtitles.not-found": t.Object({
    error: t.Literal("The requested subtitles wasn't found!", {
      examples: ["The requested subtitles wasn't found!"],
    }),
  }),
  "video-subtitles.get-subtitle-by-id.params": t.Object({
    id: t.Number(),
  }),
  "video-subtitles.get-subtitle-by-id.response": Subtitle,
  "video-subtitles.delete-subtitle.params": t.Object({
    id: t.Number(),
  }),
  "video-subtitles.delete-subtitle.response": Subtitle,
  "video-subtitles.mass-delete.body": t.Object({
    service: TranslatedService,
    provider: t.Optional(TranslationProvider),
    fromLang: t.Optional(FromLang),
    lang: t.Optional(t.String()),
    created_before: t.Optional(t.Date()),
  }),
  "video-subtitles.mass-delete.response": t.Object({
    count: t.Number({
      examples: [42],
      description: "Count of deleted subtitles",
    }),
  }),
});
