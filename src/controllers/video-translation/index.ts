import { Elysia } from "elysia";

import { videoTranslationModels } from "../../models/translation.model";
import { translationQueue } from "../../worker";
import { Translation } from "../../schemas/translation";
import TranslationFacade from "../../facades/translation";
import config from "../../config";
import { generatePreSigned } from "../../s3/save";

export default new Elysia().group("/video-translation", (app) =>
  app.use(videoTranslationModels).post(
    "/translate",
    async ({ body: { service, videoId, fromLang, toLang, provider, rawVideo } }) => {
      const video_id = videoId.toString();
      const translation = await new TranslationFacade().get({
        service,
        video_id,
        provider,
        lang_from: fromLang,
        lang_to: toLang,
      });

      const translationStatus = String(translation?.status);
      const isOutdated =
        translation?.created_at && translationStatus !== "success"
          ? new Date(translation.created_at).getTime() + config.db.outdateAfter < Date.now()
          : false;
      if (translationStatus === "success" || (translationStatus === "failed" && !isOutdated)) {
        const { id, provider, translated_url, created_at, message } = translation as Translation;
        const translatedUrl = translated_url
          ? await generatePreSigned(translated_url)
          : translated_url;
        return {
          id,
          status: translationStatus,
          provider,
          translatedUrl: translatedUrl,
          message,
          createdAt: created_at,
        };
      }

      if (!translation || isOutdated) {
        await translationQueue.add(
          `translation (${provider} ${videoId} ${fromLang} ${toLang})`,
          {
            oldTranslation: translation,
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

      if (translation && isOutdated) {
        translation.message = null;
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
