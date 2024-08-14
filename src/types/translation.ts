import { YandexType } from "vot.js/types";

export const translatedServices = [
  "mux",
  "reddit",
  "kodik",
  "kick",
  "apple_developer",
  "nineanimetv",
] as const;
export type TranslatedService = (typeof translatedServices)[number];
export type TranslationStatus = "success" | "waiting" | "parted" | "failed";
export type TranslationProvider = "yandex";

export type TranslationJobOpts = {
  hasOldTranslation: boolean;
  service: TranslatedService;
  videoId: string;
  fromLang: YandexType.RequestLang;
  toLang: YandexType.ResponseLang;
  rawVideo?: string;
  provider: TranslationProvider;
  remainingTime?: number;
};

export enum TranslationProgress {
  VIDEO_PROCESSING = 10,
  WAIT_TRANSLATION = 20,
  DOWNLOAD_TRANSLATION = 30,
}
