import { supportedService } from "../types/extractor";
import { MissingRawVideoField, UnSupportedVideoLink, VideoFileCouldntFound } from "../errors";
import MediaConverterService from "../services/mediaConverter";
import PatreonAPI from "../external/patreon";

export default async function extractVideo(
  service: supportedService,
  videoId: string | number,
  rawVideo: string = "",
) {
  switch (service) {
    case "patreon": {
      const postData = await PatreonAPI.getPosts(videoId);

      if (!postData?.data?.attributes?.post_file?.url) {
        throw new VideoFileCouldntFound();
      }

      const {
        data: {
          attributes: { post_file },
        },
      } = postData;

      return await MediaConverterService.convert(post_file.url, "m3u8-mp4");
    }
    case "reddit": {
      if (!rawVideo) {
        throw new MissingRawVideoField(service);
      }

      if (!rawVideo.startsWith("https://v.redd.it") && rawVideo.includes(".m3u8")) {
        throw new UnSupportedVideoLink();
      }

      return await MediaConverterService.convert(rawVideo, "m3u8-mp4");
    }
  }
}
