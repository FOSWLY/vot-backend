import * as fs from "fs";

import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

import config from "./config";

import healthController from "./controllers/health";
import videoTranslation from "./controllers/video-translation";
import { log } from "./logging";
import {
  InternalServerError,
  UnAuthorizedError,
  MissingRawVideoField,
  UnSupportedVideoLink,
  FailedExtractVideo,
} from "./errors";
import { HttpStatusCode } from "elysia-http-status-code";

if (!fs.existsSync(config.logging.logPath)) {
  fs.mkdirSync(config.logging.logPath, { recursive: true });
  log.info(`Created log directory`);
}

const app = new Elysia({ prefix: "/v1" })
  .use(
    swagger({
      path: "/docs",
      scalarCDN: config.app.scalarCDN,
      documentation: {
        info: {
          title: config.app.name,
          version: config.app.version,
        },
      },
    }),
  )
  .use(HttpStatusCode())
  .error({
    UNAUTHORIZED_ERROR: UnAuthorizedError,
    INTERNAL_SERVER_ERROR: InternalServerError,
    MISSING_RAW_VIDEO_FIELD: MissingRawVideoField,
    UNSUPPORTED_VIDEO_LINK: UnSupportedVideoLink,
    FAILED_EXTRACT_VIDEO: FailedExtractVideo,
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
    }

    return {
      error: error.message,
    };
  })
  .use(healthController)
  .use(videoTranslation)
  .listen({
    port: config.server.port,
    hostname: config.server.hostname,
  });

log.info(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
