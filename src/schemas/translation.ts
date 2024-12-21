import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

import { TranslatedService, TranslationProvider, TranslationStatus } from "@/types/translation";

export interface TranslationTable {
  id: Generated<number>;

  service: TranslatedService;
  video_id: string;
  status: TranslationStatus;
  provider: TranslationProvider;
  lang_from: string;
  lang_to: string;
  message: string | null;
  remaining_time: number | null;
  translated_url: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Translation = Selectable<TranslationTable>;
export type NewTranslation = Insertable<TranslationTable>;
export type TranslationUpdate = Updateable<TranslationTable>;

export type GetTranslationOpts = Pick<
  Translation,
  "service" | "video_id" | "provider" | "lang_from" | "lang_to"
>;
