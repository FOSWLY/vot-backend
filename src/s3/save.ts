import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import s3client from "./s3";
import { log } from "../logging";
import config from "../config";

const bucket = config.s3.bucket;
const URL_LIFETIME = 7200; // 2 hours

export async function saveAudio(filename: string, body: Uint8Array) {
  try {
    const results = await s3client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: body,
        ContentType: "application/mpeg",
      }),
    );

    log.debug(`Successfully created ${filename} and uploaded it to ${bucket} bucket`);
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

export async function generatePreSigned(filename: string) {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: filename });

    // @ts-ignore
    return await getSignedUrl(s3client, command, {
      expiresIn: URL_LIFETIME,
      unhoistableHeaders: new Set("x-id"),
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}
