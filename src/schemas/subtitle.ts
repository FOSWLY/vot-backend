import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

import { TranslatedService } from "@/types/translation";
import type { TranslationProvider } from "@/models/shared.model";

export interface SubtitleTable {
  id: Generated<number>;

  service: TranslatedService;
  video_id: string;
  provider: TranslationProvider;
  lang: string;
  lang_from: string | null;
  subtitle_url: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Subtitle = Selectable<SubtitleTable>;
export type NewSubtitle = Insertable<SubtitleTable> & {
  // idk, kysely add undefined and it's broke other kysely types
  lang_from: string | null;
};
export type SubtitleUpdate = Updateable<SubtitleTable>;
export type GetSubtitleOpts = Pick<Subtitle, "service" | "video_id" | "provider">;
export type MassDeleteSubtitleOpts = Pick<
  Subtitle,
  "service" | "lang_from" | "lang" | "provider"
> & {
  created_before: Date;
};
