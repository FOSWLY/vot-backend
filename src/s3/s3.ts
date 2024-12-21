import { S3Client } from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";

import config from "@/config";

export default new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyID,
    secretAccessKey: config.s3.secretAccessKey,
  },
  requestHandler: new FetchHttpHandler({
    requestTimeout: 120_000, // in ms
  }),
});
