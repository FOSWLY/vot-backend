import { ConvertFromFormat } from "@/types/services/converter";
import { TranslatedService } from "@/types/translation";

export type HelperFunction = (url: string) => Promise<string>;

export type ServiceDataItem = {
  match: string | RegExp[];
  from: ConvertFromFormat;
  skipExt?: boolean;
  helper?: HelperFunction;
};

export type ServiceData = Record<TranslatedService, ServiceDataItem>;
