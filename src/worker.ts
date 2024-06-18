import { Queue, QueueBaseOptions, Worker } from "bullmq";

import config from "./config";
import TranslationJob from "./jobs/translation";

const opts: QueueBaseOptions = {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  },
  prefix: "vtrans",
};

export const translationQueue = new Queue("translation", opts);

export const worker = new Worker("translation", TranslationJob.processor, opts)
  .on("completed", TranslationJob.onCompleted)
  .on("progress", TranslationJob.onProgress)
  .on("failed", TranslationJob.onFailed);
