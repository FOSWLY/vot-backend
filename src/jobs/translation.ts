import VOTClient from "vot.js";
import { YandexType, ClientType } from "vot.js/types";
import { getVideoData } from "vot.js/utils/videoData";
import { v4 as uuidv7 } from "uuid";
import { Job } from "bullmq";

import config from "../config";
import extractVideo from "../libs/videoExtractor";
import TranslateTextService from "../services/translateText";

import { log } from "../logging";
import { saveAudio } from "../s3/save";
import TranslationFacade from "../facades/translation";
import { FailedExtractVideo } from "../errors";
import {
  MediaConverterFailedResponse,
  MediaConverterResponse,
  TranslateTextSuccessResponse,
} from "../types/services";
import { TranslationJobOpts, TranslationProgress } from "../types/translation";
import { fetchWithTimeout } from "../libs/network";

function isFailedMediaRes(
  mediaRes: MediaConverterResponse | null,
): mediaRes is MediaConverterFailedResponse | null {
  return !mediaRes || !!(mediaRes as MediaConverterFailedResponse).error;
}

export default abstract class TranslationJob {
  static s3prefix = "vtrans";

  private static messageByProgress = {
    [TranslationProgress.VIDEO_PROCESSING]: "Видео передано в обработку",
    [TranslationProgress.WAIT_TRANSLATION]: "Ожидаем перевод видео",
    [TranslationProgress.DOWNLOAD_TRANSLATION]: "Загружаем переведенное аудио",
  };

  static async translateVideoImpl(
    client: VOTClient,
    job: Job<TranslationJobOpts>,
    videoData: ClientType.VideoData,
    timer: ReturnType<typeof setTimeout> | undefined = undefined,
    translationHelp: YandexType.TranslationHelp[] | null = null,
  ): Promise<YandexType.VideoTranslationResponse> {
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
          reject(err);
        }
      }, 30_000);
    });
  }

  static async uploadTranslatedAudio(url: string, service: string) {
    try {
      const res = await fetchWithTimeout(url, {
        headers: {
          "User-Agent": config.downloaders.userAgent,
        },
        timeout: 30_000,
      });

      const blob = await res.arrayBuffer();
      const uint8arr = new Uint8Array(blob);

      const path = `${TranslationJob.s3prefix}/${service}/${uuidv7()}.mp3`;
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
    const { oldTranslation, service, videoId, fromLang, toLang, provider, rawVideo } = job.data;
    const getBy = {
      service,
      video_id: videoId,
      provider,
      lang_from: fromLang,
      lang_to: toLang,
    };

    const translationFacade = new TranslationFacade();
    if (oldTranslation) {
      await translationFacade.delete(getBy);
    }

    await translationFacade.create({ ...getBy, status: "waiting" });

    await job.updateProgress(TranslationProgress.VIDEO_PROCESSING);

    const mediaRes = await extractVideo(service, rawVideo);
    if (isFailedMediaRes(mediaRes)) {
      throw new FailedExtractVideo();
    }

    await job.updateProgress(TranslationProgress.WAIT_TRANSLATION);
    const client = new VOTClient({
      requestLang: fromLang,
      responseLang: toLang,
    });

    // в случае ошибки сразу падает в onError, поэтому обрабатывать не надо
    const videoData = await getVideoData(mediaRes.url);
    const translateRes = await TranslationJob.translateVideoImpl(client, job, videoData);
    await job.updateProgress(TranslationProgress.DOWNLOAD_TRANSLATION);

    const path = await TranslationJob.uploadTranslatedAudio(
      (translateRes as YandexType.TranslatedVideoTranslationResponse).url,
      service,
    );

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
    const translatedMessage =
      translateRes && Object.hasOwn(translateRes, "text")
        ? (translateRes as TranslateTextSuccessResponse).text[0]
        : message;

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
    log.info(`Job ${job.id} has completed!`);
  }
}
