export type MediaFormat = "m3u8" | "m4a" | "m4v" | "mpd" | "mp4";
export type ConvertDirection = `${Exclude<MediaFormat, "mp4">}-mp4`;
export type MediaConverterStatus = "success" | "failed" | "waiting";

export type MediaConverterFinalResponse = {
  id: number;
  status: MediaConverterStatus;
  direction: ConvertDirection;
  file_hash: string;
  download_url: string;
  message: string;
  createdAt: string;
  removeOn: string;
};

export type MediaConverterWaitingResponse = {
  status: MediaConverterStatus;
  message: string;
};

export type MediaConverterErrorResponse = {
  error: string;
};

export type MediaConverterResponse =
  | MediaConverterFinalResponse
  | MediaConverterWaitingResponse
  | MediaConverterErrorResponse;

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
