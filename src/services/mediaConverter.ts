import config from "../config";
import { convertDirection, MediaConverterResponse } from "../types/services";

export default class MediaConverterService {
  static hostname: string = config.services.mediaConverter.hostname;
  private static token: string = config.services.mediaConverter.token;

  static async convert(
    url: string,
    direction: convertDirection,
  ): Promise<MediaConverterResponse | null> {
    try {
      const res = await fetch(`${this.hostname}/v1/convert`, {
        method: "POST",
        body: JSON.stringify({
          file: url,
          direction,
        }),
        headers: {
          Authorization: `Basic ${MediaConverterService.token}`,
          "Content-Type": "application/json",
        },
      });

      return (await res.json()) as MediaConverterResponse;
    } catch (err) {
      console.error(`Failed to convert ${url}`, err);
      return null;
    }
  }
}
