import { TranslatedService } from "../types/translation";
import { MissingRawVideoField, UnSupportedVideoLink } from "../errors";
import MediaConverterService from "../services/mediaConverter";

const serviceCDNs: Record<TranslatedService, string | RegExp[]> = {
  mux: "stream.mux.com",
  reddit: "v.redd.it",
  kodik: "cloud.kodik-storage.com",
  kick: "clips.kick.com",
  apple_developer: "devstreaming-cdn.apple.com",
  nineanimetv: [
    /^.*\.betterstream\.cc$/, // wildcard
    /^.*\.biananset\.net$/, // wildcard
  ],
};

export default async function extractVideo(service: TranslatedService, rawVideo = "") {
  if (!rawVideo) {
    throw new MissingRawVideoField(service);
  }

  if (!Object.keys(serviceCDNs).includes(service)) {
    throw new UnSupportedVideoLink();
  }

  const url = new URL(rawVideo);
  const possibleCdn: string | RegExp[] = serviceCDNs[service];
  const isArrayCdns = Array.isArray(possibleCdn);
  if ((!isArrayCdns && !url.hostname.endsWith(possibleCdn)) || !url.pathname.includes(".m3u8")) {
    throw new UnSupportedVideoLink();
  }

  if (isArrayCdns && !possibleCdn.find((cdn) => cdn.exec(url.hostname))) {
    throw new UnSupportedVideoLink();
  }

  return await MediaConverterService.fullConvert(rawVideo, "m3u8-mp4");
}
