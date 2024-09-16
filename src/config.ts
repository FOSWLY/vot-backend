import * as path from "node:path";
import { type Level } from "pino";

import { version } from "../package.json";

export default {
  server: {
    port: Bun.env.SERVICE_PORT ?? 3001,
    hostname: Bun.env.SERVICE_HOST ?? "0.0.0.0",
  },
  app: {
    name: Bun.env.APP_NAME ?? "[FOSWLY] VOT Backend",
    desc: Bun.env.APP_DESC ?? "",
    version,
    license: "MIT",
    github_url: "https://github.com/FOSWLY/vot-backend",
    contact_email: Bun.env.APP_CONTACT_EMAIL ?? "me@toil.cc",
    scalarCDN: "https://unpkg.com/@scalar/api-reference@1.15.1/dist/browser/standalone.js",
  },
  cors: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  },
  logging: {
    level: (Bun.env.NODE_ENV === "production" ? "info" : "debug") as Level,
    logPath: path.join(__dirname, "..", "logs"),
    loki: {
      host: Bun.env.LOKI_HOST ?? "",
      user: Bun.env.LOKI_USER ?? "",
      password: Bun.env.LOKI_PASSWORD ?? "",
      label: Bun.env.LOKI_LABEL ?? "vot-backend",
    },
  },
  services: {
    mediaConverter: {
      hostname: Bun.env.MEDIA_CONVERTER_HOSTNAME ?? "http://127.0.0.1:3001",
      token: Bun.env.MEDIA_CONVERTER_TOKEN ?? "",
      maxReqInterrupt: 120, // if the number of request repeats > the maxRequestInterrupt, then abort as a failure
      convertReqInterval: 2500, // 24 req/min for single convert
    },
    translateText: {
      hostname: Bun.env.TRANSLATE_TEXT_HOSTNAME ?? "http://127.0.0.1:3313",
    },
  },
  db: {
    name: Bun.env.POSTGRES_NAME ?? "vot-backend",
    host: Bun.env.POSTGRES_HOST ?? "127.0.0.1",
    port: Bun.env.POSTGRES_PORT ?? 5432,
    user: Bun.env.POSTGRES_USER ?? "postgres",
    password: Bun.env.POSTGRES_PASSWORD ?? "postgres",
    outdateAfter: 604_800_000, // in ms
  },
  redis: {
    host: Bun.env.REDIS_HOST ?? "127.0.0.1",
    port: Bun.env.REDIS_PORT ?? 6379,
    username: Bun.env.REDIS_USER ?? "default",
    password: Bun.env.REDIS_PASSWORD ?? "",
    prefix: Bun.env.REDIS_PREFIX ?? "votb", // Only for DB caching. BullMQ uses other prefix!
    ttl: Bun.env.REDIS_TTL ?? 7200, // Only for DB caching. BullMQ uses own impl
  },
  s3: {
    region: Bun.env.S3_REGION ?? "ru-central1", // if you use other s3 provider change this region
    endpoint: Bun.env.S3_ENDPOINT ?? "https://storage.yandexcloud.net",
    bucket: Bun.env.S3_BUCKET ?? "example",
    accessKeyID: Bun.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: Bun.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  navigation: {
    defaultLimit: Number(Bun.env.NAVIGATION_DEFAULT_LIMIT ?? 10),
    maxLimit: Number(Bun.env.NAVIGATION_MAX_LIMIT ?? 50),
    maxPage: 2147483647,
  },
  downloaders: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 YaBrowser/24.4.0.0 Safari/537.36",
  },
};
