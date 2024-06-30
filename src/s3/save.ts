import { PutObjectCommand } from "@aws-sdk/client-s3";

import s3client from "./s3";
import { log } from "../logging";
import config from "../config";

export async function saveAudio(filename: string, body: Uint8Array) {
  try {
    const bucket = config.s3.bucket;
    const results = await s3client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: body,
        ContentType: "application/mpeg",
      }),
    );

    // TODO: add get signed url
    log.info(`Successfully created ${filename} and uploaded it to ${bucket} bucket`);
    return {
      statusCode: results.$metadata.httpStatusCode,
      success: results.$metadata.httpStatusCode === 200,
      etag: results.ETag,
    };
  } catch (err: any) {
    log.error(
      `Failed to save audio file (${filename}) to s3 bucket ${config.s3.bucket}`,
      err.message,
    );
    return {
      success: false,
      message: err.message,
    };
  }
}
