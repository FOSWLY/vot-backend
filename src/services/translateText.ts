import config from "../config";
import { fetchWithTimeout } from "../libs/network";
import { TranslateTextResponse, TranslateLang } from "../types/services";

export default class TranslateTextService {
  static hostname: string = config.services.translateText.hostname;

  static async translate(text: string, lang: TranslateLang): Promise<TranslateTextResponse | null> {
    try {
      const urlParams = new URLSearchParams({
        text,
        lang,
      }).toString();
      const res = await fetchWithTimeout(`${this.hostname}/translate?${urlParams}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return (await res.json()) as TranslateTextResponse;
    } catch (err) {
      console.error(`Failed to translate text "${text}"`, err);
      return null;
    }
  }
}
