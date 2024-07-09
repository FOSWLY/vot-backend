import { Translation } from "../schemas/translation";
import { YandexType } from "vot.js";

export const translatedServices = ["mux", "reddit", "kodik"] as const;
export type TranslatedService = (typeof translatedServices)[number];
export type TranslationStatus = "success" | "waiting" | "parted" | "failed";
export type TranslationProvider = "yandex";

export type TranslationJobOpts = {
  oldTranslation: null | Translation;
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
