import { Elysia } from "elysia";

import { videoTranslationModels } from "../../models/translation.model";
import { findTranslation } from "../../database/repositories/translation";
import { translationQueue } from "../../worker";
import { Translation } from "../../database/schemas/translation";

export default new Elysia().group("/video-translation", (app) =>
  app.use(videoTranslationModels).post(
    "/translate",
    async ({ body: { service, videoId, fromLang, toLang, provider, rawVideo } }) => {
      const video_id = videoId.toString();
      const translation = await findTranslation(service, video_id, provider, fromLang, toLang);

      const translationStatus = String(translation?.status);
      if (["failed", "success"].includes(translationStatus)) {
        const { id, provider, translated_url, created_at, message } = translation as Translation;
        return {
          id,
          status: translationStatus,
          provider,
          translatedUrl: translated_url,
          message,
          createdAt: created_at,
        };
      }

      if (!translation) {
        await translationQueue.add(
          `translation (${provider} ${videoId} ${fromLang} ${toLang})`,
          {
            service,
            videoId: video_id,
            fromLang,
            toLang,
            provider,
            rawVideo,
          },
          {
            removeOnComplete: {
              age: 3600,
              count: 1000,
            },
            removeOnFail: true,
          },
        );
      }

      return {
        status: "waiting",
        remainingTime: translation?.remaining_time ?? -1,
        message: translation?.message ?? "Подготавливаем перевод",
      };
    },
    {
      body: "video-translation.translate",
      detail: {
        summary: "Translate video from service",
        tags: ["Translate"],
      },
    },
  ),
);
