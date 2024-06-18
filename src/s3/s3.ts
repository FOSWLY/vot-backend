import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
// import { S3Client } from "@bradenmacdonald/s3-lite-client";
import config from "../config";

export default new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyID,
    secretAccessKey: config.s3.secretAccessKey,
  },
});
