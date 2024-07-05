import { PutBucketCorsCommand } from "@aws-sdk/client-s3";

import s3client from "../src/s3/s3";
import config from "../src/config";

const bucket = config.s3.bucket;

export async function disableCors() {
  return await s3client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            // CORSRule
            ID: "DISABLE_CORS",
            AllowedHeaders: [
              // AllowedHeaders
              "*",
            ],
            AllowedMethods: [
              // AllowedMethods // required
              "GET",
            ],
            AllowedOrigins: [
              // AllowedOrigins // required
              "*",
            ],
            ExposeHeaders: [
              // ExposeHeaders
              "*",
            ],
          },
        ],
      },
    }),
  );
}

const res = await disableCors();
console.log(
  res.$metadata.httpStatusCode === 200
    ? "Successfully disabled CORS"
    : `Failed to disable CORS. Response: ${JSON.stringify(res)}`,
);