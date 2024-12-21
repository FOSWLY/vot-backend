import { VOTWorkerClient } from "@vot.js/node";
import { getVideoData } from "@vot.js/node/utils/videoData";
import { TranslationHelp, TranslatedVideoTranslationResponse } from "@vot.js/core/types/yandex";
import { VideoData } from "@vot.js/core/types/client";

import { v7 as uuidv7 } from "uuid";
import { Job } from "bullmq";

import config from "../config";
import extractVideo from "../videoExtractor/extractor";
import TranslateTextService from "../services/translateText";

import { log } from "../logging";
import { deleteAudio, saveAudio } from "../s3/actions";
import TranslationFacade from "../facades/translation";
import { FailedExtractVideo } from "../errors";
import {
  ConverterErrorResponse,
  ConverterFinalResponse,
  ConverterResponse,
  ConverterWaitingResponse,
} from "../types/services/converter";
import { TranslationJobOpts, TranslationProgress } from "../types/translation";
import { fetchWithTimeout } from "../libs/network";

function isSuccessMediaRes(mediaRes: ConverterResponse | null): mediaRes is ConverterFinalResponse {
  return !(
    !mediaRes ||
    !!(mediaRes as ConverterErrorResponse)?.error ||
    (mediaRes as ConverterWaitingResponse)?.status !== "success"
  );
}

export default abstract class TranslationJob {
  static s3prefix = "vtrans";

  private static messageByProgress = {
    [TranslationProgress.VIDEO_PROCESSING]: "Видео передано в обработку",
    [TranslationProgress.WAIT_TRANSLATION]: "Ожидаем перевод видео",
    [TranslationProgress.DOWNLOAD_TRANSLATION]: "Загружаем переведенное аудио",
  };

  static async translateVideoImpl(
    client: VOTWorkerClient,
    job: Job<TranslationJobOpts>,
    videoData: VideoData,
    timer: ReturnType<typeof setTimeout> | undefined = undefined,
    translationHelp: TranslationHelp[] | null = null,
  ): Promise<TranslatedVideoTranslationResponse> {
    clearTimeout(timer);
    const res = await client.translateVideo({
      videoData,
      translationHelp,
    });

    await job.updateData({
      ...job.data,
      remainingTime: res.remainingTime,
    });

    if (res.translated && res.remainingTime < 1) {
      log.debug(res, "Translation finished with this data: ");
      return res;
    }

    await job.updateProgress(TranslationProgress.WAIT_TRANSLATION);

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timer = setTimeout(async () => {
        try {
          const res = await TranslationJob.translateVideoImpl(
            client,
            job,
            videoData,
            timer,
            translationHelp,
          );
          if (res.translated && res.remainingTime < 1) {
            resolve(res);
          }
        } catch (err) {
          // bullmq can't prevent timed out errors
          reject(err as Error);
        }
      }, 30_000);
    });
  }

  static async uploadTranslatedAudio(url: string, service: string) {
    try {
      log.debug({ url, service }, "Fetching translated audio");

      const res = await fetchWithTimeout(url, {
        headers: {
          "User-Agent": config.downloaders.userAgent,
        },
        timeout: 60_000,
      });

      const blob = await res.arrayBuffer();
      const uint8arr = new Uint8Array(blob);

      const path = `${TranslationJob.s3prefix}/${service}/${uuidv7()}.mp3`;
      log.debug({ url, service }, "Saving translated audio to s3");
      const s3result = await saveAudio(path, uint8arr);
      if (!s3result.success) {
        throw new Error(`Failed to upload audio to s3 bucket. Possible error: ${s3result.message}`);
      }

      return path;
    } catch (err: unknown) {
      log.error(`Failed to upload audio from ${url}`, (err as Error).message);
      return null;
    }
  }

  static async processor(job: Job<TranslationJobOpts>) {
    const { hasOldTranslation, service, videoId, fromLang, toLang, provider, rawVideo } = job.data;
    const getBy = {
      service,
      video_id: videoId,
      provider,
      lang_from: fromLang,
      lang_to: toLang,
    };

    const translationFacade = new TranslationFacade();
    if (hasOldTranslation) {
      const old = await translationFacade.delete(getBy);
      if (old?.translated_url) {
        await deleteAudio(old.translated_url);
      }
    }

    await translationFacade.create({ ...getBy, status: "waiting" });

    await job.updateProgress(TranslationProgress.VIDEO_PROCESSING);

    const mediaRes = await extractVideo(service, rawVideo);
    if (!isSuccessMediaRes(mediaRes)) {
      throw new FailedExtractVideo(
        (mediaRes as ConverterWaitingResponse)?.message ??
          (mediaRes as ConverterErrorResponse)?.error,
      );
    }

    await job.updateProgress(TranslationProgress.WAIT_TRANSLATION);
    const client = new VOTWorkerClient({
      requestLang: fromLang,
      responseLang: toLang,
    });

    // в случае ошибки сразу падает в onError, поэтому обрабатывать не надо
    const videoData = await getVideoData(mediaRes.download_url);
    const translateRes = await TranslationJob.translateVideoImpl(client, job, videoData);
    await job.updateProgress(TranslationProgress.DOWNLOAD_TRANSLATION);

    const path = await TranslationJob.uploadTranslatedAudio(translateRes.url, service);
    if (!path) {
      throw new Error("Failed to upload translated audio");
    }

    await translationFacade.update(
      { service, video_id: videoId, provider, lang_from: fromLang, lang_to: toLang },
      {
        status: "success",
        remaining_time: null,
        message: "",
        translated_url: path,
      },
    );
  }

  static async onProgress(job: Job<TranslationJobOpts>, progress: number | object) {
    log.info(job.data, `Job ${job.id} progressed to ${progress as number}`);

    const { service, videoId, fromLang, toLang, provider, remainingTime } = job.data;

    const message =
      TranslationJob.messageByProgress[progress as TranslationProgress] ?? "Выполняем перевод";

    await new TranslationFacade().update(
      { service, video_id: videoId, provider, lang_from: fromLang, lang_to: toLang },
      {
        status: "waiting",
        remaining_time: remainingTime,
        message,
      },
    );
  }

  static async onFailed(job: Job<TranslationJobOpts> | undefined, error: Error) {
    const message = error.message;
    log.error(`${job?.id} has failed with ${message}`);
    if (!job) {
      return;
    }

    const { service, videoId, fromLang, toLang, provider } = job.data;
    // в бд храним только русские сообщения
    const translateRes = await TranslateTextService.translate(message, "en-ru");
    const translatedMessage = translateRes ? translateRes.translations[0] : message;

    await new TranslationFacade().update(
      { service, video_id: videoId, provider, lang_from: fromLang, lang_to: toLang },
      {
        status: "failed",
        remaining_time: null,
        message: translatedMessage,
      },
    );
  }

  static onCompleted(job: Job) {
    log.debug(`Job ${job.id} has completed!`);
  }
}
