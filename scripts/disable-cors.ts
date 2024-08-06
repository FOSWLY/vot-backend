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
            ID: "DISABLE_CORS",
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: ["*"],
            MaxAgeSeconds: 86400,
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
