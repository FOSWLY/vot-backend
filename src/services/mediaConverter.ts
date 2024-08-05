import config from "../config";
import { fetchWithTimeout } from "../libs/network";
import { log } from "../logging";
import {
  ConvertDirection,
  MediaConverterErrorResponse,
  MediaConverterFinalResponse,
  MediaConverterResponse,
} from "../types/services";

export default class MediaConverterService {
  static hostname: string = config.services.mediaConverter.hostname;
  private static token: string = config.services.mediaConverter.token;
  private static maxReqInterrupt: number = config.services.mediaConverter.maxReqInterrupt;
  private static convertReqInterval: number = config.services.mediaConverter.convertReqInterval;

  static async convert(
    url: string,
    direction: ConvertDirection,
  ): Promise<MediaConverterResponse | null> {
    try {
      const res = await fetchWithTimeout(`${this.hostname}/v1/convert`, {
        method: "POST",
        body: JSON.stringify({
          file: url,
          direction,
        }),
        timeout: 10000,
        headers: {
          Authorization: `Basic ${MediaConverterService.token}`,
          "Content-Type": "application/json",
        },
      });

      return (await res.json()) as MediaConverterResponse;
    } catch (err) {
      log.error(`Failed to convert ${url}`, err);
      return null;
    }
  }

  // make requests until the final result is received
  static async fullConvert(
    url: string,
    direction: ConvertDirection,
    timer: ReturnType<typeof setTimeout> | undefined = undefined,
    reqNum: number = 0,
  ): Promise<MediaConverterResponse | null> {
    clearTimeout(timer);
    const response = await MediaConverterService.convert(url, direction);
    if (
      !response ||
      (response as MediaConverterErrorResponse)?.error ||
      (response as MediaConverterFinalResponse)?.status !== "waiting"
    ) {
      return response;
    }

    if (reqNum > MediaConverterService.maxReqInterrupt) {
      // if the number of requests > the maxRequestInterrupt, then abort as a failure
      return null;
    }

    return new Promise((resolve) => {
      timer = setTimeout(async () => {
        reqNum++;
        const response = await MediaConverterService.fullConvert(url, direction, timer, reqNum);
        if (
          !response ||
          (response as MediaConverterErrorResponse).error ||
          (response as MediaConverterFinalResponse)?.status !== "waiting"
        ) {
          return resolve(response);
        }
      }, MediaConverterService.convertReqInterval);
    });
  }
}
