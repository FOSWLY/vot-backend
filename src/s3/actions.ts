import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import s3client, { s3PreSignedClient } from "./s3";
import { log } from "@/logging";
import config from "@/config";

const { bucket, lifeTime } = config.s3;

export async function saveFile(
  filename: string,
  body: Uint8Array,
  contentType = "application/mpeg",
) {
  try {
    const results = await s3client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: body,
        ContentType: contentType,
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
      `Failed to save file (${filename}) to s3 bucket ${bucket}`,
    );
    return {
      success: false,
      message,
    };
  }
}

export async function deleteFile(filename: string) {
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
      `Failed to delete file (${filename}) from s3 bucket ${bucket}`,
    );
    return {
      success: false,
      message,
    };
  }
}

/**
 * Maximum: 1000 filenames per requests
 */
export async function massDeleteFiles(filenames: string[]) {
  try {
    const results = await s3client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: filenames.map((filename) => ({ Key: filename })),
        },
      }),
    );

    log.debug(`Successfully deleted ${filenames.length} files from ${bucket} bucket`);
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

    return await getSignedUrl(s3PreSignedClient, command, {
      expiresIn: lifeTime,
      unhoistableHeaders: new Set("x-id"),
    });
  } catch (err) {
    log.error(err);
    return null;
  }
}
