import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import s3client from "./s3";
import { log } from "@/logging";
import config from "@/config";

const { bucket } = config.s3;
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
  } catch (err) {
    const message = (err as Error).message;
    log.error(
      {
        err: message,
      },
      `Failed to save audio file (${filename}) to s3 bucket ${bucket}`,
    );
    return {
      success: false,
      message,
    };
  }
}

export async function deleteAudio(filename: string) {
  try {
    const results = await s3client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: filename,
      }),
    );

    log.debug(`Successfully deleted ${filename} from ${bucket} bucket`);
    return {
      statusCode: results.$metadata.httpStatusCode,
      success: results.$metadata.httpStatusCode === 204,
    };
  } catch (err) {
    const message = (err as Error).message;
    log.error(
      {
        err: message,
      },
      `Failed to delete audio file (${filename}) from s3 bucket ${bucket}`,
    );
    return {
      success: false,
      message,
    };
  }
}

export async function massDeleteAudio(filenames: string[]) {
  try {
    const results = await s3client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: filenames.map((filename) => ({ Key: filename })),
        },
      }),
    );

    log.debug(`Successfully deleted ${filenames.length} audio files from ${bucket} bucket`);
    return {
      statusCode: results.$metadata.httpStatusCode,
      success: results.$metadata.httpStatusCode === 204,
    };
  } catch (err) {
    const message = (err as Error).message;
    log.error(
      {
        err: message,
        filenames,
      },
      `Failed to delete ${filenames.length} audio files from s3 bucket ${bucket}`,
    );
    return {
      success: false,
      message,
    };
  }
}

export async function generatePreSigned(filename: string) {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: filename });

    return await getSignedUrl(s3client, command, {
      expiresIn: URL_LIFETIME,
      unhoistableHeaders: new Set("x-id"),
    });
  } catch (err) {
    log.error(err);
    return null;
  }
}
