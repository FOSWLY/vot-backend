import { RequestLang, ResponseLang } from "@vot.js/shared/types/data";
import { VideoService } from "@vot.js/core/types/service";

export const translatedServices = [
  VideoService.reddit,
  VideoService.kodik,
  VideoService.kick,
  VideoService.apple_developer,
  VideoService.epicgames,
  "mux",
  "artstation",
] as const;
export const translationProviders = ["yandex"] as const;

export type TranslatedService = (typeof translatedServices)[number];
export type TranslationProvider = (typeof translationProviders)[number];

export type TranslationJobOpts = {
  hasOldTranslation: boolean;
  service: TranslatedService;
  videoId: string;
  fromLang: RequestLang;
  toLang: ResponseLang;
  rawVideo?: string;
  provider: TranslationProvider;
  remainingTime?: number;
};

export enum TranslationProgress {
  VIDEO_PROCESSING = 10,
  WAIT_TRANSLATION = 20,
  DOWNLOAD_TRANSLATION = 30,
}
