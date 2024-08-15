export type TranslateLang = `${string}-${string}`;
export type TranslateTextSuccessResponse = {
  code: number;
  lang: TranslateLang;
  text: string[];
};

export type TranslateTextFailResponse = {
  code: number;
  message: string;
};

export type TranslateTextResponse = TranslateTextSuccessResponse | TranslateTextFailResponse;
