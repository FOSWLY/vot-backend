import { VOTWorkerClient } from "@vot.js/node";
import { getVideoData } from "@vot.js/node/utils/videoData";
import { TranslationHelp, TranslatedVideoTranslationResponse } from "@vot.js/core/types/yandex";
import { VideoData } from "@vot.js/core/types/client";

import { randomUUIDv7 } from "bun";
import { Job } from "bullmq";

import extractVideo from "@/videoExtractor/extractor";
import TranslateTextService from "@/services/translateText";

import { log } from "@/logging";
import { deleteFile, saveFile } from "@/s3/actions";
import TranslationFacade from "@/facades/translation";
import { FailedExtractVideo } from "@/errors";
import {
  ConverterErrorResponse,
  ConverterFinalResponse,
  ConverterResponse,
  ConverterWaitingResponse,
} from "@/types/services/converter";
import { TranslationJobOpts, TranslationProgress } from "@/types/translation";
import { fetchWithTimeout } from "@/libs/network";
import SubtitleFacade from "@/facades/subtitle";
import { VideoService } from "@vot.js/core/types/service";

function isSuccessMediaRes(mediaRes: ConverterResponse | null): mediaRes is ConverterFinalResponse {
  return !(
    !mediaRes ||
    !!(mediaRes as ConverterErrorResponse)?.error ||
    (mediaRes as ConverterWaitingResponse)?.status !== "success"
  );
}

export default abstract class TranslationJob {
  static s3AudioPrefix = "vtrans";
  static s3SubPrefix = "vsubs";

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
          resolve(
            await TranslationJob.translateVideoImpl(client, job, videoData, timer, translationHelp),
          );
        } catch (err) {
          // bullmq can't prevent timed out errors
          reject(err as Error);
        }
      }, 30_000);
    });
  }

  static async uploadFile(url: string, service: string, prefix = TranslationJob.s3AudioPrefix) {
    try {
      log.debug({ url, service }, "Fetching file");
      const res = await fetchWithTimeout(url, {
        timeout: 60_000,
      });

      const blob = await res.arrayBuffer();
      const uint8arr = new Uint8Array(blob);
      const path = `${prefix}/${service}/${randomUUIDv7()}.mp3`;
      log.debug({ url, service }, "Saving file to s3");
      const s3result = await saveFile(path, uint8arr);
      if (!s3result.success) {
        throw new Error(`Failed to upload file to s3 bucket. Possible error: ${s3result.message}`);
      }

      return path;
    } catch (err) {
      log.error(`Failed to upload file from ${url}. Possible error: ${(err as Error).message}`);
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
        await deleteFile(old.translated_url);
      }
    }

    await translationFacade.create({ ...getBy, status: "waiting" });

    await job.updateProgress(TranslationProgress.VIDEO_PROCESSING);

    const mediaRes = await extractVideo(service, rawVideo);
    if (!isSuccessMediaRes(mediaRes)) {
      throw new FailedExtractVideo(
        (mediaRes as ConverterWaitingResponse)?.message ??
          (mediaRes as ConverterErrorResponse)?.error ??
          "media converter is unavailable",
      );
    }

    await job.updateProgress(TranslationProgress.WAIT_TRANSLATION);
    const client = new VOTWorkerClient({
      requestLang: fromLang,
      responseLang: toLang,
    });

    // в случае ошибки сразу падает в onError, поэтому обрабатывать не нужно
    const videoData = await getVideoData(mediaRes.download_url);
    const translateRes = await TranslationJob.translateVideoImpl(client, job, videoData);
    await job.updateProgress(TranslationProgress.DOWNLOAD_TRANSLATION);

    const path = await TranslationJob.uploadFile(
      translateRes.url,
      service,
      TranslationJob.s3AudioPrefix,
    );
    if (!path) {
      throw new Error("Failed to upload translated audio");
    }

    await TranslationJob.addSubtitles(client, job, videoData);

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

  static async addSubtitles(
    client: VOTWorkerClient,
    job: Job<TranslationJobOpts>,
    videoData: VideoData<VideoService>,
  ) {
    try {
      const res = await client.getSubtitles({
        videoData,
      });
      if (!res.subtitles.length) {
        return false;
      }

      const { service, videoId, provider } = job.data;
      const subtitleFacade = new SubtitleFacade();
      const existsLangPairs = (
        await subtitleFacade.getAll({
          service,
          video_id: videoId,
          provider,
        })
      ).map((sub) => (sub.lang_from ? `${sub.lang_from}-${sub.lang}` : sub.lang));

      const uploadAndAdd = async (url: string, lang: string, lang_from: string | null) => {
        const path = await TranslationJob.uploadFile(url, service, TranslationJob.s3SubPrefix);
        if (!path) {
          return false;
        }

        await subtitleFacade.create({
          lang: lang,
          lang_from,
          service,
          provider,
          video_id: videoId,
          subtitle_url: path,
        });
      };

      await Promise.allSettled(
        res.subtitles.map(async (sub) => {
          if (!existsLangPairs.includes(sub.language)) {
            await uploadAndAdd(sub.url, sub.language, null);
          }

          if (
            sub.translatedLanguage &&
            !existsLangPairs.includes(`${sub.language}-${sub.translatedLanguage}`)
          ) {
            await uploadAndAdd(sub.translatedUrl, sub.translatedLanguage, sub.language);
          }
          return sub;
        }),
      );
      return true;
    } catch {
      return false;
    }
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
