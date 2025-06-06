import { MissingRawVideoField, UnSupportedVideoLink } from "@/errors";
import MediaConverterService from "@/services/mediaConverter";
import { TranslatedService } from "@/types/translation";
import { ServiceData } from "@/types/videoExtrator/extractor";
import { getPlaylist } from "@/videoExtractor/helper/epicgames";

const services: ServiceData = {
  mux: {
    match: "stream.mux.com",
    from: "m3u8",
  },
  reddit: {
    match: "v.redd.it",
    from: "m3u8",
  },
  kodik: {
    match: "cloud.kodik-storage.com",
    from: "m3u8",
  },
  kick: {
    match: [/^stream\.kick\.com$/, /^clips\.kick\.com$/],
    from: "m3u8",
  },
  apple_developer: {
    match: "devstreaming-cdn.apple.com",
    from: "m3u8",
  },
  epicgames: {
    match: "cdn.qstv.on.epicgames.com",
    from: "mpd",
    helper: getPlaylist,
    skipExt: true,
  },
  artstation: {
    match: "cdn.qstv.on.epicgames.com",
    from: "mpd",
    helper: getPlaylist,
    skipExt: true,
  },
  deeplearningai: {
    match: "dyckms5inbsqq.cloudfront.net",
    from: "m3u8",
  },
};

export default async function extractVideo(service: TranslatedService, rawVideo = "") {
  if (!rawVideo) {
    throw new MissingRawVideoField(service);
  }

  if (!Object.keys(services).includes(service)) {
    throw new UnSupportedVideoLink();
  }

  const url = new URL(rawVideo);
  const serviceData = services[service];
  const possibleCdn: string | RegExp[] = serviceData.match;
  const isArrayCdns = Array.isArray(possibleCdn);
  if (
    (!isArrayCdns && !url.hostname.endsWith(possibleCdn)) ||
    (!serviceData.skipExt && !url.pathname.includes(`.${serviceData.from}`))
  ) {
    throw new UnSupportedVideoLink();
  }

  if (isArrayCdns && !possibleCdn.find((cdn) => cdn.exec(url.hostname))) {
    throw new UnSupportedVideoLink();
  }

  if (serviceData.helper) {
    rawVideo = await serviceData.helper(rawVideo);
    if (!rawVideo) {
      throw new MissingRawVideoField(service);
    }
  }

  return await MediaConverterService.fullConvert(rawVideo, `${serviceData.from}-mp4`);
}
