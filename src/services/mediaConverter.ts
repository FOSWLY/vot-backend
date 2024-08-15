import config from "../config";
import { fetchWithTimeout } from "../libs/network";
import { log } from "../logging";
import {
  ConvertDirection,
  ConverterErrorResponse,
  ConverterFinalResponse,
  ConverterResponse,
} from "../types/services/converter";

export default class MediaConverterService {
  static hostname: string = config.services.mediaConverter.hostname;
  private static token: string = config.services.mediaConverter.token;
  private static maxReqInterrupt: number = config.services.mediaConverter.maxReqInterrupt;
  private static convertReqInterval: number = config.services.mediaConverter.convertReqInterval;

  static async convert(
    url: string,
    direction: ConvertDirection,
  ): Promise<ConverterResponse | null> {
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

      return (await res.json()) as ConverterResponse;
    } catch (err) {
      log.error(`Failed to convert ${url}`, err);
      return null;
    }
  }

  static isFinishedConvert(
    response: ConverterResponse | null,
  ): response is ConverterFinalResponse | ConverterErrorResponse {
    return !!(
      !response ||
      (response as ConverterErrorResponse)?.error ||
      (response as ConverterFinalResponse)?.status !== "waiting"
    );
  }

  // make requests until the final result is received
  static async fullConvert(
    url: string,
    direction: ConvertDirection,
    timer: ReturnType<typeof setTimeout> | undefined = undefined,
    reqNum = 0,
  ): Promise<ConverterResponse | null> {
    clearTimeout(timer);
    const response = await MediaConverterService.convert(url, direction);
    if (MediaConverterService.isFinishedConvert(response)) {
      return response;
    }

    if (reqNum > MediaConverterService.maxReqInterrupt) {
      // if the number of requests > the maxRequestInterrupt, then abort as a failure
      return null;
    }

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timer = setTimeout(async () => {
        reqNum++;
        const response = await MediaConverterService.fullConvert(url, direction, timer, reqNum);
        if (MediaConverterService.isFinishedConvert(response)) {
          resolve(response);
        }
      }, MediaConverterService.convertReqInterval);
    });
  }
}
