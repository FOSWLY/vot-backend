import * as path from "node:path";

import { Value } from "@sinclair/typebox/value";

import { ConfigSchema } from "@/schemas/config";

export default Value.Parse(ConfigSchema, {
  server: {
    port: Bun.env.SERVICE_PORT,
    hostname: Bun.env.SERVICE_HOST,
  },
  app: {
    name: Bun.env.APP_NAME,
    desc: Bun.env.APP_DESC,
    contact_email: Bun.env.APP_CONTACT_EMAIL,
  },
  cors: {},
  logging: {
    level: Bun.env.NODE_ENV === "production" ? "info" : "debug",
    logPath: path.join(__dirname, "..", "logs"),
    logToFile: Bun.env.LOG_TO_FILE === "true",
    loki: {
      host: Bun.env.LOKI_HOST,
      user: Bun.env.LOKI_USER,
      password: Bun.env.LOKI_PASSWORD,
      label: Bun.env.LOKI_LABEL,
    },
  },
  services: {
    mediaConverter: {
      hostname: Bun.env.MEDIA_CONVERTER_HOSTNAME,
      token: Bun.env.MEDIA_CONVERTER_TOKEN,
    },
    translateText: {
      hostname: Bun.env.TRANSLATE_TEXT_HOSTNAME,
    },
    votWorker: {
      hostname: Bun.env.VOT_WORKER_HOSTNAME,
      apiToken: Bun.env.VOT_WORKER_API_TOKEN,
    },
  },
  db: {
    name: Bun.env.POSTGRES_NAME,
    host: Bun.env.POSTGRES_HOST,
    port: Bun.env.POSTGRES_PORT,
    user: Bun.env.POSTGRES_USER,
    password: Bun.env.POSTGRES_PASSWORD,
  },
  redis: {
    host: Bun.env.REDIS_HOST,
    port: Bun.env.REDIS_PORT,
    username: Bun.env.REDIS_USER,
    password: Bun.env.REDIS_PASSWORD,
    prefix: Bun.env.REDIS_PREFIX,
    ttl: Bun.env.REDIS_TTL,
  },
  s3: {
    region: Bun.env.S3_REGION,
    endpoint: Bun.env.S3_ENDPOINT,
    preSignedEndpoint: Bun.env.S3_PRESIGNED_ENDPOINT || Bun.env.S3_ENDPOINT,
    bucket: Bun.env.S3_BUCKET,
    accessKeyID: Bun.env.S3_ACCESS_KEY_ID,
    secretAccessKey: Bun.env.S3_SECRET_ACCESS_KEY,
    forcePathStyle: Bun.env.S3_FORCE_PATH_STYLE === "true",
  },
  navigation: {},
  downloaders: {},
});
