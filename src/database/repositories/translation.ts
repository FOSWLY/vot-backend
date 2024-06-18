import { TranslatedService, TranslationProvider } from "../../types/translation";
import { db } from "../database";
import { TranslationUpdate, Translation, NewTranslation } from "../schemas/translation";

export async function findTranslation(
  service: TranslatedService,
  video_id: string,
  provider: TranslationProvider,
  lang_from: string,
  lang_to: string,
) {
  let query = db
    .selectFrom("vot_translations")
    .where("service", "=", service)
    .where("video_id", "=", video_id)
    .where("provider", "=", provider)
    .where("lang_from", "=", lang_from)
    .where("lang_to", "=", lang_to);

  return await query.selectAll().executeTakeFirst();
}

export async function findTranslations(criteria: Partial<Translation>) {
  let query = db.selectFrom("vot_translations");

  if (criteria.id) {
    query = query.where("id", "=", criteria.id); // Kysely is immutable, you must re-assign!
  }

  if (criteria.service) {
    query = query.where("service", "=", criteria.service);
  }

  if (criteria.video_id) {
    query = query.where("video_id", "=", criteria.video_id);
  }

  if (criteria.status) {
    query = query.where("status", "=", criteria.status);
  }

  if (criteria.provider) {
    query = query.where("provider", "=", criteria.provider);
  }

  if (criteria.translated_url !== undefined) {
    query = query.where(
      "translated_url",
      criteria.translated_url === null ? "is" : "=",
      criteria.translated_url,
    );
  }

  if (criteria.created_at) {
    query = query.where("created_at", "=", criteria.created_at);
  }

  return await query.selectAll().execute();
}

export async function updateTranslation(
  service: TranslatedService,
  video_id: string,
  provider: TranslationProvider,
  lang_from: string,
  lang_to: string,
  updateWith: TranslationUpdate,
) {
  await db
    .updateTable("vot_translations")
    .set(updateWith)
    .where("service", "=", service)
    .where("video_id", "=", video_id)
    .where("provider", "=", provider)
    .where("lang_from", "=", lang_from)
    .where("lang_to", "=", lang_to)
    .execute();
}

export async function createTranslation(translation: NewTranslation) {
  return await db
    .insertInto("vot_translations")
    .values(translation)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function deleteTranslation(id: number) {
  return await db
    .deleteFrom("vot_translations")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}
