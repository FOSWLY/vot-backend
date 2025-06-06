import { S3Client as S3DeprecatedClient } from "@aws-sdk/client-s3";
import { S3Client, S3Options } from "bun";

import config from "@/config";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";

const { region, endpoint, accessKeyID: accessKeyId, secretAccessKey, forcePathStyle } = config.s3;

const clientOpts: S3Options = {
  region,
  endpoint,
  accessKeyId,
  secretAccessKey,
  virtualHostedStyle: !forcePathStyle,
};

export default new S3Client(clientOpts);
export const s3PreSignedClient = new S3Client({
  ...clientOpts,
  endpoint: config.s3.preSignedEndpoint,
});

/**
 * Currently Bun S3 API doesn't support deleteObjects, so we use the deprecated client for that
 *
 * @link waiting 1 https://github.com/oven-sh/bun/pull/16847
 * @link waiting 2 https://github.com/oven-sh/bun/issues/19112
 */
export const s3DeprecatedClient = new S3DeprecatedClient({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  requestHandler: new FetchHttpHandler({
    requestTimeout: 120_000, // in ms
  }),
  forcePathStyle,
});
