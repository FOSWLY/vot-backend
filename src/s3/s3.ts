import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";

import config from "@/config";

const clientOpts: S3ClientConfig = {
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyID,
    secretAccessKey: config.s3.secretAccessKey,
  },
  requestHandler: new FetchHttpHandler({
    requestTimeout: 120_000, // in ms
  }),
  forcePathStyle: config.s3.forcePathStyle,
};

export default new S3Client(clientOpts);
export const s3PreSignedClient = new S3Client({
  ...clientOpts,
  endpoint: config.s3.preSignedEndpoint,
});
