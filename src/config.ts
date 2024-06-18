import * as path from "node:path";
import { LoggerLevel } from "./types/logging";
import { version } from "../package.json";

export default {
  server: {
    port: Bun.env.SERVICE_PORT ?? 3001,
    hostname: "0.0.0.0",
  },
  app: {
    name: "[FOSWLY] VOT Backend",
    desc: "",
    version,
    publicPath: path.join(__dirname, "..", "public"),
    scalarCDN: "https://unpkg.com/@scalar/api-reference@1.15.1/dist/browser/standalone.js",
  },
  logging: {
    level: LoggerLevel.DEBUG,
    logRequests: false, // for debugging (true/false)
    logPath: path.join(__dirname, "..", "logs"),
  },
  services: {
    mediaConverter: {
      hostname: Bun.env.MEDIA_CONVERTER_HOSTNAME ?? "http://127.0.0.1:3001",
      token: Bun.env.MEDIA_CONVERTER_TOKEN ?? "x",
    },
    translateText: {
      hostname: Bun.env.TRANSLATE_TEXT_HOSTNAME ?? "http://127.0.0.1:3313",
    },
  },
  db: {
    name: Bun.env.POSTGRES_NAME ?? "vot-backend",
    host: Bun.env.POSTGRESQL_HOST ?? "127.0.0.1",
    port: Bun.env.POSTGRES_PORT ?? 5432,
    user: Bun.env.POSTGRES_USER ?? "postgres",
    password: Bun.env.POSTGRES_PASSWORD ?? "postgres",
  },
  redis: {
    host: Bun.env.REDIS_HOST ?? "127.0.0.1",
    port: Bun.env.REDIS_PORT ?? 6379,
    password: Bun.env.REDIS_PASSWORD ?? "",
  },
  s3: {
    region: Bun.env.S3_REGION ?? "ru-central1", // if you use other s3 provider change this region
    endpoint: Bun.env.S3_ENDPOINT ?? "https://storage.yandexcloud.net",
    bucket: Bun.env.S3_BUCKET ?? "example",
    accessKeyID: Bun.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: Bun.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  downloaders: {
    bannedChars: ["\\", "/", ":", "*", "?", '"', "<", ">", "|"],
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 YaBrowser/24.4.0.0 Safari/537.36",
  },
};
