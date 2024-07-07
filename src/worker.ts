/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import { Queue, QueueBaseOptions, Worker } from "bullmq";

import config from "./config";
import TranslationJob from "./jobs/translation";

const { host, port, username, password } = config.redis;
const concurrency = 200; // https://docs.bullmq.io/guide/workers/concurrency

const opts: QueueBaseOptions = {
  connection: {
    host,
    port,
    username,
    password,
  },
  prefix: "vtrans",
};

export const translationQueue = new Queue("translation", opts);

export const worker = new Worker("translation", TranslationJob.processor, {
  ...opts,
  concurrency,
})
  .on("completed", TranslationJob.onCompleted)
  .on("progress", TranslationJob.onProgress)
  .on("failed", TranslationJob.onFailed);
