import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

import s3client, { s3DeprecatedClient, s3PreSignedClient } from "./s3";
import { log } from "@/logging";
import config from "@/config";

const { bucket, lifeTime } = config.s3;

export async function saveFile(
  filename: string,
  body: Uint8Array,
  contentType = "application/mpeg",
) {
  try {
    const s3file = s3client.file(filename, {
      bucket,
      type: contentType,
    });

    const bytes = await s3file.write(body);

    log.debug(`Successfully created ${filename} and uploaded it to ${bucket} bucket`);
    return {
      success: bytes !== 0,
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
    await s3client.delete(filename, {
      bucket,
    });

    log.debug(`Successfully deleted ${filename} from ${bucket} bucket`);
    return {
      success: true,
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
    const results = await s3DeprecatedClient.send(
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

export function generatePreSigned(filename: string) {
  try {
    return s3PreSignedClient.presign(filename, {
      expiresIn: lifeTime,
      bucket,
    });
  } catch (err) {
    log.error(err);
    return null;
  }
}
