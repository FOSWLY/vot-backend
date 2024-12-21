import type { ClientType, BaseProviderType } from "@toil/translate/types";

import config from "../config";
import { fetchWithTimeout } from "../libs/network";
import { FOSWLYErrorResponse } from "../types/services/translateText";
import { log } from "../logging";

export default class TranslateTextService {
  static hostname: string = config.services.translateText.hostname;

  static isFOSWLYError<T extends object>(
    data: T | FOSWLYErrorResponse,
  ): data is FOSWLYErrorResponse {
    return Object.hasOwn(data, "error");
  }

  static async translate(text: string, lang: ClientType.LangPair) {
    try {
      const urlParams = new URLSearchParams({
        text,
        lang,
      }).toString();
      const res = await fetchWithTimeout(`${this.hostname}/v2/translate?${urlParams}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = (await res.json()) as FOSWLYErrorResponse | BaseProviderType.TranslationResponse;
      if (TranslateTextService.isFOSWLYError(data)) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      log.error(`Failed to translate text "${text}"`, err);
      return null;
    }
  }
}
