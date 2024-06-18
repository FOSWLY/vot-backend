import VOTClient, { YandexType } from "vot.js";
import { v4 as uuidv4 } from "uuid";
import { Job } from "bullmq";

import config from "../config";
import extractVideo from "../libs/videoExtractor";
import TranslateTextService from "../services/translateText";

import { log } from "../setup";
import { saveAudio } from "../s3/save";
import { createTranslation, updateTranslation } from "../database/repositories/translation";
import { FailedExtractVideo } from "../errors";
import { TranslateTextSuccessResponse } from "../types/services";
import { TranslationJobOpts, TranslationProgress } from "../types/translation";
import { normalizeVideoId } from "../libs/utils";

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
    url: string,
    timer: ReturnType<typeof setTimeout> | undefined = undefined,
    translationHelp: YandexType.TranslationHelp[] | null = null,
  ): Promise<YandexType.VideoTranslationResponse> {
    clearTimeout(timer);
    const res = await client.translateVideo({
      url,
      translationHelp,
    });

    await job.updateData({
      ...job.data,
      remainingTime: res.remainingTime,
    });

    if (res.translated && res.remainingTime < 1) {
      log.debug("Translation finished with this data: ", res);
      return res;
    }

    await job.updateProgress(TranslationProgress.WAIT_TRANSLATION);

    return new Promise((resolve) => {
      timer = setTimeout(async () => {
        const res = await TranslationJob.translateVideoImpl(
          client,
          job,
          url,
          timer,
          translationHelp,
        );
        if (res.translated && res.remainingTime < 1) {
          resolve(res);
        }
      }, 30_000);
    });
  }

  static async uploadTranslatedAudio(url: string, service: string) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": config.downloaders.userAgent,
        },
      });

      const blob = await res.arrayBuffer();
      const uint8arr = new Uint8Array(blob as ArrayBuffer);

      const path = `${TranslationJob.s3prefix}/${service}/${uuidv4()}.mp3`;
      const s3result = await saveAudio(path, uint8arr);
      if (!s3result.success) {
        throw new Error(`Failed to upload audio to s3 bucket. Possible error: ${s3result.message}`);
      }

      return path;
    } catch (err: any) {
      log.error(`Failed to upload audio from ${url}`, err.message);
      return null;
    }
  }

  static async processor(job: Job<TranslationJobOpts>) {
    const { service, videoId, fromLang, toLang, provider, rawVideo } = job.data;
    await createTranslation({
      service,
      video_id: videoId,
      status: "waiting",
      provider,
      lang_from: fromLang,
      lang_to: toLang,
    });

    await job.updateProgress(TranslationProgress.VIDEO_PROCESSING);

    const mediaRes = await extractVideo(service, videoId, rawVideo);
    if (!mediaRes) {
      throw new FailedExtractVideo();
    }

    await job.updateProgress(TranslationProgress.WAIT_TRANSLATION);

    // const outAudioPath = `${service}/${normalizeVideoId(videoId)}.mp3`;
    // console.log(outAudioPath);

    const client = new VOTClient({
      requestLang: fromLang,
      responseLang: toLang,
    });

    // в случае ошибки сразу падает в onError, поэтому обрабатывать не надо
    const translateRes = await TranslationJob.translateVideoImpl(client, job, mediaRes.url);
    await job.updateProgress(TranslationProgress.DOWNLOAD_TRANSLATION);

    const path = await TranslationJob.uploadTranslatedAudio(
      (translateRes as YandexType.TranslatedVideoTranslationResponse).url,
      service,
    );

    if (!path) {
      throw new Error("Failed to upload translated audio");
    }

    await updateTranslation(service, videoId, provider, fromLang, toLang, {
      status: "success",
      remaining_time: null,
      message: "",
      translated_url: `${config.s3.endpoint}/${config.s3.bucket}/${path}`,
    });
  }

  static async onProgress(job: Job<TranslationJobOpts>, progress: number | object) {
    log.info(`Job ${job.id} progressed to ${progress}`, job.data);

    const { service, videoId, fromLang, toLang, provider, remainingTime } = job.data;

    let message =
      TranslationJob.messageByProgress[progress as TranslationProgress] ?? "Выполняем перевод";

    await updateTranslation(service, videoId, provider, fromLang, toLang, {
      status: "waiting",
      remaining_time: remainingTime,
      message,
    });
  }

  static async onFailed(job: Job<TranslationJobOpts> | undefined, error: Error) {
    const message = error.message;
    log.error(`${job?.id} has failed with ${message}`);
    if (!job) {
      return;
    }

    const { service, videoId, fromLang, toLang, provider } = job.data;
    const translateRes = await TranslateTextService.translate(message, "en-ru");
    const translatedMessage =
      translateRes && Object.hasOwn(translateRes, "text")
        ? (translateRes as TranslateTextSuccessResponse).text[0]
        : message;

    await updateTranslation(service, videoId, provider, fromLang, toLang, {
      status: "failed",
      remaining_time: null,
      message: translatedMessage,
    });
  }

  static async onCompleted(job: Job, returnValue: any) {
    log.info(`Job ${job.id} has completed!`);
  }
}
