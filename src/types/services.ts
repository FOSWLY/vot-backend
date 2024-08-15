import { ConvertFromFormat } from "./services/converter";
import { TranslatedService } from "./translation";

export type ServiceDataItem = {
  match: string | RegExp[];
  from: ConvertFromFormat;
  skipExt?: boolean;
};

export type ServiceData = Record<TranslatedService, ServiceDataItem>;
