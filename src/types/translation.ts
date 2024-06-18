export type TranslatedService = "patreon" | "reddit" | "unknown";
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
  service: Exclude<TranslatedService, "unknown">;
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
