import { Translation } from "../schemas/translation";

export const translatedServices = ["mux", "reddit", "kodik"] as const;
export type TranslatedService = (typeof translatedServices)[number];
export type TranslationStatus = "success" | "waiting" | "parted" | "failed";
export type TranslationProvider = "yandex";
export type TranslationFromLang =
  | "auto"
  | "ru"
  | "en"
  | "zh"
  | "ko"
  | "lt"
  | "lv"
  | "ar"
  | "fr"
  | "it"
  | "es"
  | "de"
  | "ja";
export type TranslationToLang = "ru" | "en" | "kk";

export type TranslationJobOpts = {
  oldTranslation: null | Translation;
  service: TranslatedService;
  videoId: string;
  fromLang: TranslationFromLang;
  toLang: TranslationToLang;
  rawVideo?: string;
  provider: TranslationProvider;
  remainingTime?: number;
};

export enum TranslationProgress {
  VIDEO_PROCESSING = 10,
  WAIT_TRANSLATION = 20,
  DOWNLOAD_TRANSLATION = 30,
}
