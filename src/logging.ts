import * as path from "node:path";

import { pino } from "pino";

import config from "./config";

const { loki } = config.logging;
const startingDate = new Date().toISOString().split("T")[0];

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      level: config.logging.level,
      options: {
        colorized: true,
      },
    },
    {
      target: "pino-loki",
      level: config.logging.level,
      options: {
        batching: true,
        interval: 5,
        labels: { application: "vot-backend" },
        host: loki.host,
        basicAuth:
          loki.user && loki.password
            ? {
                username: loki.user,
                password: loki.password,
              }
            : undefined,
      },
    },
    {
      target: "pino/file",
      level: config.logging.level,
      options: {
        destination: path.join(config.logging.logPath, `${startingDate}.log`),
      },
    },
  ],
});

export const log = pino(transport);
