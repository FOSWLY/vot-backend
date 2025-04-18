import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { HttpStatusCode } from "elysia-http-status-code";

import config from "@/config";

import healthController from "@/controllers/health";
import videoTranslation from "@/controllers/video-translation";
import videoSubtitles from "@/controllers/video-subtitles";
import { log } from "@/logging";
import {
  InternalServerError,
  UnAuthorizedError,
  MissingRawVideoField,
  UnSupportedVideoLink,
  FailedExtractVideo,
  TranslationNotFound,
  SubtitleNotFound,
} from "@/errors";

const app = new Elysia({ prefix: "/v1" })
  .use(
    swagger({
      path: "/docs",
      scalarCDN: config.app.scalarCDN,
      scalarConfig: {
        spec: {
          url: "/v1/docs/json",
        },
      },
      documentation: {
        info: {
          title: config.app.name,
          version: config.app.version,
          license: {
            name: config.app.license,
          },
          contact: {
            name: "Developer",
            url: config.app.github_url,
            email: config.app.contact_email,
          },
        },
      },
    }),
  )
  .use(HttpStatusCode())
  .onRequest(({ set }) => {
    for (const [key, val] of Object.entries(config.cors)) {
      set.headers[key] = val;
    }
  })
  .error({
    UNAUTHORIZED_ERROR: UnAuthorizedError,
    INTERNAL_SERVER_ERROR: InternalServerError,
    MISSING_RAW_VIDEO_FIELD: MissingRawVideoField,
    UNSUPPORTED_VIDEO_LINK: UnSupportedVideoLink,
    FAILED_EXTRACT_VIDEO: FailedExtractVideo,
    TRANSLATION_NOT_FOUND: TranslationNotFound,
    SUBTITLE_NOT_FOUND: SubtitleNotFound,
  })
  .onError(({ set, code, error, httpStatus }) => {
    switch (code) {
      case "NOT_FOUND":
        return {
          detail: "Route not found :(",
        };
      case "VALIDATION":
        return error.all;
      case "MISSING_RAW_VIDEO_FIELD":
        set.status = httpStatus.HTTP_422_UNPROCESSABLE_ENTITY;
        break;
      case "UNAUTHORIZED_ERROR":
        set.status = httpStatus.HTTP_401_UNAUTHORIZED;
        break;
      case "UNSUPPORTED_VIDEO_LINK":
        set.status = httpStatus.HTTP_400_BAD_REQUEST;
        break;
      case "TRANSLATION_NOT_FOUND":
      case "SUBTITLE_NOT_FOUND":
        set.status = httpStatus.HTTP_404_NOT_FOUND;
        break;
    }

    return {
      error: (error as Error).message,
    };
  })
  .use(healthController)
  .use(videoTranslation)
  .use(videoSubtitles)
  .listen({
    port: config.server.port,
    hostname: config.server.hostname,
  });

log.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
