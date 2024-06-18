export type mediaFormat = "m3u8" | "m4a" | "m4v" | "mpd" | "mp4";
export type convertDirection = `${Exclude<mediaFormat, "mp4">}-mp4`;

export type MediaConverterResponse = {
  url: string;
  removeOn: string;
};

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
