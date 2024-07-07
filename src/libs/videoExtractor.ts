import { TranslatedService } from "../types/translation";
import { MissingRawVideoField, UnSupportedVideoLink } from "../errors";
import MediaConverterService from "../services/mediaConverter";

const serviceCDNs: Partial<Record<TranslatedService, string>> = {
  mux: "stream.mux.com",
  reddit: "v.redd.it",
  kodik: "cloud.kodik-storage.com",
};

export default async function extractVideo(service: TranslatedService, rawVideo = "") {
  if (!rawVideo) {
    throw new MissingRawVideoField(service);
  }

  switch (service) {
    case "mux":
    case "kodik":
    case "reddit": {
      const url = new URL(rawVideo);
      if (!url.hostname.endsWith(serviceCDNs[service]!) || !url.pathname.includes(".m3u8")) {
        throw new UnSupportedVideoLink();
      }

      return await MediaConverterService.convert(rawVideo, "m3u8-mp4");
    }
  }
}
