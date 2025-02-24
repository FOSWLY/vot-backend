import { SubtitleTable } from "@/schemas/subtitle";
import { TranslationTable } from "@/schemas/translation";

export interface Database {
  vot_translations: TranslationTable;
  vot_subtitles: SubtitleTable;
}
