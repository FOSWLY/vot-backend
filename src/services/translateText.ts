import config from "../config";
import { TranslateTextResponse, TranslateLang } from "../types/services";

export default class TranslateTextService {
  static hostname: string = config.services.translateText.hostname;

  static async translate(text: string, lang: TranslateLang): Promise<TranslateTextResponse | null> {
    try {
      const res = await fetch(
        `${this.hostname}/translate?${new URLSearchParams({
          text,
          lang,
        })}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return await res.json();
    } catch (err) {
      console.error(`Failed to translate text "${text}"`, err);
      return null;
    }
  }
}
