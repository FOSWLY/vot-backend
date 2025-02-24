import { Type as t, type Static } from "@sinclair/typebox";
import { config } from "@vot.js/shared";

import { version } from "../../package.json";

export const LoggingLevel = t.Union(
  [
    t.Literal("info"),
    t.Literal("debug"),
    t.Literal("fatal"),
    t.Literal("error"),
    t.Literal("warn"),
    t.Literal("trace"),
  ],
  {
    default: "info",
  },
);

const license = "MIT";
const scalarCDN = "https://unpkg.com/@scalar/api-reference@latest/dist/browser/standalone.js";

export const ConfigSchema = t.Object({
  server: t.Object({
    port: t.Number({ default: 3001 }),
    hostname: t.String({ default: "0.0.0.0" }),
  }),
  app: t.Object({
    name: t.String({ default: "[FOSWLY] VOT Backend" }),
    desc: t.String({ default: "" }),
    version: t.Literal(version, { readOnly: true, default: version }),
    license: t.Literal(license, { readOnly: true, default: license }),
    github_url: t.String({
      default: "https://github.com/FOSWLY/vot-backend",
    }),
    contact_email: t.String({ default: "me@toil.cc" }),
    scalarCDN: t.Literal(scalarCDN, { readOnly: true, default: scalarCDN }),
  }),
  cors: t.Object({
    "Access-Control-Allow-Origin": t.String({ default: "*" }),
    "Access-Control-Allow-Headers": t.String({ default: "*" }),
    "Access-Control-Allow-Methods": t.String({ default: "POST, GET, DELETE, OPTIONS" }),
    "Access-Control-Max-Age": t.String({ default: "86400" }),
  }),
  logging: t.Object({
    level: LoggingLevel,
    logPath: t.String(),
    logToFile: t.Boolean({ default: false }),
    loki: t.Object({
      host: t.String({ default: "" }),
      user: t.String({ default: "" }),
      password: t.String({ default: "" }),
      label: t.String({ default: "vot-backend" }),
    }),
  }),
  services: t.Object({
    mediaConverter: t.Object({
      hostname: t.String({ default: "http://127.0.0.1:3001" }),
      token: t.String({ default: "" }),
      maxReqInterrupt: t.Number({ default: 120 }), // if the number of request repeats > the maxRequestInterrupt, then abort as a failure
      convertReqInterval: t.Number({ default: 2500 }), // 24 req/min for single convert
    }),
    translateText: t.Object({
      hostname: t.String({ default: "http://127.0.0.1:3313" }),
    }),
  }),
  db: t.Object({
    name: t.String({ default: "vot-backend" }),
    host: t.String({ default: "127.0.0.1" }),
    port: t.Number({ default: 5432 }),
    user: t.String({ default: "postgres" }),
    password: t.String({ default: "postgres" }),
    outdateAfter: t.Number({ default: 604_800_000 }), // in ms
  }),
  redis: t.Object({
    host: t.String({ default: "127.0.0.1" }),
    port: t.Number({ default: 6379 }),
    username: t.String({ default: "default" }),
    password: t.String({ default: "" }),
    prefix: t.String({ default: "votb" }), // Only for DB caching. BullMQ uses other prefix!
    ttl: t.Number({ default: 7200 }), // Only for DB caching. BullMQ uses own impl
  }),
  s3: t.Object({
    region: t.String({ default: "eu-central-1" }), // if you use other s3 provider change this region
    endpoint: t.String({ default: "http://127.0.0.1:9000" }),
    preSignedEndpoint: t.String({ default: "http://127.0.0.1:9000" }),
    lifeTime: t.Number({ default: 7200 }),
    bucket: t.String({ default: "vot-backend" }),
    accessKeyID: t.String({ default: "root" }),
    secretAccessKey: t.String({ default: "changeme" }),
    forcePathStyle: t.Boolean({ default: false }),
  }),
  navigation: t.Object({
    defaultLimit: t.Number({ default: 10 }),
    maxLimit: t.Number({ default: 50 }),
    maxPage: t.Number({ default: 2147483647 }),
  }),
  downloaders: t.Object({
    userAgent: t.String({
      default: config.userAgent,
    }),
  }),
});

export type ConfigSchemaType = Static<typeof ConfigSchema>;
