import { Elysia, t } from "elysia";

import { coreModels } from "@/models/core.model";
import { videoSubtitleModels } from "@/models/subtitle.model";
import SubtitleFacade from "@/facades/subtitle";
import { deleteFile, generatePreSigned, massDeleteFiles } from "@/s3/actions";
import { validateAuthToken } from "@/libs/security";
import { getNavigationData, validateNavigation } from "@/libs/navigation";
import { chunks, isValidId } from "@/libs/utils";
import { SubtitleNotFound } from "@/errors";

export default new Elysia({
  detail: {
    tags: ["Subtitles"],
  },
}).group("/video-subtitles", (app) =>
  app
    .use(coreModels)
    .use(videoSubtitleModels)
    .post(
      "/get-subtitles",
      async ({ body: { service, video_id, provider } }) => {
        const subtitles = await new SubtitleFacade().get({
          service,
          video_id: video_id.toString(),
          provider,
        });

        const subtitlesWithPreSigned = await Promise.all(
          subtitles.map(async (subtitle) => {
            const url = await generatePreSigned(subtitle.subtitle_url);
            if (!url) {
              return false;
            }

            subtitle.subtitle_url = url;
            return subtitle;
          }),
        );

        return subtitlesWithPreSigned.filter((subtitle) => subtitle !== false);
      },
      {
        body: "video-subtitles.get-subtitle.body",
        response: {
          200: "video-subtitles.get-subtitle.response",
        },
        detail: {
          summary: "Get subtitles for video from service",
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

              const subtitleFacade = new SubtitleFacade();
              const subtitles = await subtitleFacade.getAll({}, offset, limit);
              const totatSubtitles = await subtitleFacade.getTotal();
              const navigation = getNavigationData(page, totatSubtitles, limit);
              return {
                subtitles,
                navigation,
              };
            },
            {
              query: "video-subtitles.list.query",
              response: "video-subtitles.list.response",
              detail: {
                summary: "Get list of subtitles",
              },
            },
          )
          .get(
            "/subtitle/:id",
            async ({ params: { id } }) => {
              if (!isValidId(id)) {
                throw new SubtitleNotFound();
              }

              const subtitle = await new SubtitleFacade().getById(id);
              if (!subtitle) {
                throw new SubtitleNotFound();
              }

              return subtitle;
            },
            {
              params: "video-subtitles.get-subtitle-by-id.params",
              response: {
                200: "video-subtitles.get-subtitle-by-id.response",
                404: "video-subtitles.not-found",
              },
              detail: {
                summary: "Get info about subtitle by id",
              },
            },
          )
          .delete(
            "/subtitle/:id",
            async ({ params: { id } }) => {
              if (!isValidId(id)) {
                throw new SubtitleNotFound();
              }

              const subtitle = await new SubtitleFacade().deleteById(id);
              if (!subtitle) {
                throw new SubtitleNotFound();
              }

              if (subtitle?.subtitle_url) {
                await deleteFile(subtitle.subtitle_url);
              }

              return subtitle;
            },
            {
              params: "video-subtitles.delete-subtitle.params",
              response: {
                200: "video-subtitles.delete-subtitle.response",
                404: "video-subtitles.not-found",
              },
              detail: {
                summary: "Delete subtitle by id",
              },
            },
          )
          .delete(
            "/subtitle",
            async ({ body: { service, lang, fromLang, provider, created_before } }) => {
              const subtitles = await new SubtitleFacade().massDelete({
                service,
                lang,
                lang_from: fromLang,
                provider,
                created_before,
              });

              if (subtitles?.length) {
                const filenames = subtitles
                  .filter((subtitle) => subtitle.subtitle_url)
                  .map((subtitle) => subtitle.subtitle_url);

                const chunkedFilenames = chunks(filenames, 900);
                await Promise.allSettled(
                  chunkedFilenames.map(async (chunk) => await massDeleteFiles(chunk)),
                );
              }

              const count = subtitles?.length ?? 0;
              return {
                count,
              };
            },
            {
              body: "video-subtitles.mass-delete.body",
              response: { 200: "video-subtitles.mass-delete.response" },
              detail: {
                summary: "Mass delete subtitles",
              },
            },
          ),
    ),
);
