import { t, Static } from "elysia";

import { availableLangs, availableTTS } from "@vot.js/shared/consts";

import { translatedServices, translationProviders } from "@/types/translation";
import { StringsToLiterals } from "@/libs/utils";

export const FromLang = t.Union(StringsToLiterals(availableLangs));
export type FromLang = Static<typeof FromLang>;

export const ToLang = t.Union(StringsToLiterals(availableTTS));
export type ToLang = Static<typeof ToLang>;

export const TranslatedService = t.Union(StringsToLiterals(translatedServices));
export type TranslatedService = Static<typeof TranslatedService>;

export const TranslationProvider = t.Union(StringsToLiterals(translationProviders), {
  description: "The provider that makes the translation",
  examples: ["yandex"],
});
export type TranslationProvider = Static<typeof TranslationProvider>;

export const VideoId = t.Union([t.String(), t.Number()]);
export type VideoId = Static<typeof VideoId>;
