import { db } from "@/database/database";
import {
  TranslationUpdate,
  Translation,
  NewTranslation,
  GetTranslationOpts,
  MassDeleteTranslationOpts,
} from "@/schemas/translation";
import BaseRepository from "./base";
import config from "@/config";

export default class TranslationRepository extends BaseRepository {
  constructor() {
    super("vot_translations");
  }

  async get({ service, video_id, provider, lang_from, lang_to }: GetTranslationOpts) {
    const query = db
      .selectFrom(this.dbName)
      .where("service", "=", service)
      .where("video_id", "=", video_id)
      .where("provider", "=", provider)
      .where("lang_from", "=", lang_from)
      .where("lang_to", "=", lang_to);

    return await query.selectAll().executeTakeFirst();
  }

  async getById(id: number) {
    const query = db.selectFrom(this.dbName).where("id", "=", id);

    return await query.selectAll().executeTakeFirst();
  }

  async getAll(
    criteria: Partial<Translation> = {},
    offset = 0,
    limit = config.navigation.defaultLimit,
  ) {
    let query = db.selectFrom(this.dbName);
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

    if (criteria.message !== undefined) {
      query = query.where("message", criteria.message === null ? "is" : "=", criteria.message);
    }

    if (criteria.remaining_time !== undefined) {
      query = query.where(
        "remaining_time",
        criteria.remaining_time === null ? "is" : "=",
        criteria.remaining_time,
      );
    }

    if (criteria.created_at) {
      query = query.where("created_at", "=", criteria.created_at);
    }

    if (offset > 0) {
      query = query.offset(offset);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    return await query.orderBy("id").selectAll().execute();
  }

  async getTotal() {
    return await db
      .selectFrom(this.dbName)
      .select((eb) => [eb.fn.count<number>("id").as("total")])
      .executeTakeFirst();
  }

  async update(
    { service, video_id, provider, lang_from, lang_to }: GetTranslationOpts,
    updateWith: TranslationUpdate,
  ) {
    await db
      .updateTable(this.dbName)
      .set(updateWith)
      .where("service", "=", service)
      .where("video_id", "=", video_id)
      .where("provider", "=", provider)
      .where("lang_from", "=", lang_from)
      .where("lang_to", "=", lang_to)
      .execute();
  }

  async create(translation: NewTranslation) {
    return await db
      .insertInto(this.dbName)
      .values(translation)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete({ service, video_id, provider, lang_from, lang_to }: GetTranslationOpts) {
    return await db
      .deleteFrom(this.dbName)
      .where("service", "=", service)
      .where("video_id", "=", video_id)
      .where("provider", "=", provider)
      .where("lang_from", "=", lang_from)
      .where("lang_to", "=", lang_to)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteById(id: number) {
    return await db.deleteFrom(this.dbName).where("id", "=", id).returningAll().executeTakeFirst();
  }

  async massDelete(criteria: Partial<MassDeleteTranslationOpts> = {}) {
    let query = db.deleteFrom(this.dbName);
    if (criteria.status) {
      query = query.where("status", "=", criteria.status);
    }

    if (criteria.service) {
      query = query.where("service", "=", criteria.service);
    }

    if (criteria.provider) {
      query = query.where("provider", "=", criteria.provider);
    }

    if (criteria.lang_from) {
      query = query.where("lang_from", "=", criteria.lang_from);
    }

    if (criteria.lang_to) {
      query = query.where("lang_to", "=", criteria.lang_to);
    }

    if (criteria.created_before) {
      query = query.where("created_at", "<", criteria.created_before);
    }

    return await query.returningAll().execute();
  }
}
