import { Elysia, t } from "elysia";

import { videoTranslationModels } from "@/models/translation.model";
import { coreModels } from "@/models/core.model";
import { translationQueue } from "@/worker";
import TranslationFacade from "@/facades/translation";
import config from "@/config";
import { generatePreSigned, deleteFile, massDeleteFiles } from "@/s3/actions";
import { validateAuthToken } from "@/libs/security";
import { getNavigationData, validateNavigation } from "@/libs/navigation";
import { chunks, isValidId } from "@/libs/utils";
import { TranslationNotFound } from "@/errors";

export default new Elysia({
  detail: {
    tags: ["Translate"],
  },
}).group("/video-translation", (app) =>
  app
    .use(coreModels)
    .use(videoTranslationModels)
    .post(
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

        const translationStatus = translation?.status;
        const isOutdated =
          translation?.created_at && translationStatus !== "success"
            ? new Date(translation.created_at).getTime() + config.db.outdateAfter < Date.now()
            : false;
        if (translationStatus === "success" || (translationStatus === "failed" && !isOutdated)) {
          const { id, provider, translated_url, created_at, message } = translation!;
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
            `translation (${service} ${provider} ${videoId} ${fromLang} ${toLang})`,
            {
              hasOldTranslation: isOutdated,
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
              debounce: {
                id: `${service}-${provider}-${videoId}-${fromLang}-${toLang}`,
                ttl: 5000,
              },
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
        body: "video-translation.translate.body",
        response: {
          200: "video-translation.translate.response",
        },
        detail: {
          summary: "Translate video from service",
        },
      },
    )
    .guard(
      {
        response: {
          401: "not-authenticated",
        },
        headers: t.Object({
          authorization: t.String({
            description: "Authorization Basic token",
            default: "Basic <token>",
          }),
        }),
        beforeHandle: ({ headers: { authorization } }) => {
          if (!validateAuthToken(authorization)) return;
        },
      },
      (app) =>
        app
          .get(
            "/list",
            async ({ query: { page, limit } }) => {
              let offset;
              ({ page, limit, offset } = validateNavigation(page, limit));

              const translationFacade = new TranslationFacade();
              const translations = await translationFacade.getAll({}, offset, limit);
              const totalTranslations = await translationFacade.getTotal();
              const navigation = getNavigationData(page, totalTranslations, limit);
              return {
                translations,
                navigation,
              };
            },
            {
              query: "video-translation.list.query",
              response: "video-translation.list.response",
              detail: {
                summary: "Get list of translates",
              },
            },
          )
          .get(
            "/translate/:id",
            async ({ params: { id } }) => {
              if (!isValidId(id)) {
                throw new TranslationNotFound();
              }

              const translation = await new TranslationFacade().getById(id);
              if (!translation) {
                throw new TranslationNotFound();
              }

              return translation;
            },
            {
              params: "video-translation.get-translate-by-id.params",
              response: {
                200: "video-translation.get-translate-by-id.response",
                404: "video-translation.not-found",
              },
              detail: {
                summary: "Get info about translation by id",
              },
            },
          )
          .delete(
            "/translate/:id",
            async ({ params: { id } }) => {
              if (!isValidId(id)) {
                throw new TranslationNotFound();
              }

              const translation = await new TranslationFacade().deleteById(id);
              if (!translation) {
                throw new TranslationNotFound();
              }

              if (translation?.translated_url) {
                await deleteFile(translation.translated_url);
              }

              return translation;
            },
            {
              params: "video-translation.delete-translate.params",
              response: {
                200: "video-translation.delete-translate.response",
                404: "video-translation.not-found",
              },
              detail: {
                summary: "Delete translated video by id",
              },
            },
          )
          .delete(
            "/translate",
            async ({ body: { service, status, toLang, fromLang, provider, created_before } }) => {
              const translations = await new TranslationFacade().massDelete({
                service,
                status,
                lang_to: toLang,
                lang_from: fromLang,
                provider,
                created_before,
              });

              if (translations?.length) {
                const filenames = translations
                  .filter((translation) => translation.translated_url)
                  .map((translation) => translation.translated_url!);

                const chunkedFilenames = chunks(filenames, 900);
                await Promise.allSettled(
                  chunkedFilenames.map(async (chunk) => await massDeleteFiles(chunk)),
                );
              }

              const count = translations?.length ?? 0;
              return {
                count,
              };
            },
            {
              body: "video-translation.mass-delete.body",
              response: { 200: "video-translation.mass-delete.response" },
              detail: {
                summary: "Mass delete translations",
              },
            },
          ),
    ),
);
