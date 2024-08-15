export type MediaFormat = "m3u8" | "m4a" | "m4v" | "mpd" | "mp4";
export type ConvertFromFormat = Exclude<MediaFormat, "mp4">;
export type ConvertDirection = `${ConvertFromFormat}-mp4`;
export type ConverterStatus = "success" | "failed" | "waiting";

export type ConverterFinalResponse = {
  id: number;
  status: ConverterStatus;
  direction: ConvertDirection;
  file_hash: string;
  download_url: string;
  message: string;
  createdAt: string;
  removeOn: string;
};

export type ConverterWaitingResponse = {
  status: ConverterStatus;
  message: string;
};

export type ConverterErrorResponse = {
  error: string;
};

export type ConverterResponse =
  | ConverterFinalResponse
  | ConverterWaitingResponse
  | ConverterErrorResponse;
