import { db } from "@/database/database";
import {
  GetSubtitleOpts,
  MassDeleteSubtitleOpts,
  NewSubtitle,
  Subtitle,
  SubtitleUpdate,
} from "@/schemas/subtitle";
import BaseRepository from "./base";
import config from "@/config";

export default class SubtitleRepository extends BaseRepository {
  constructor() {
    super("vot_subtitles");
  }

  async get({ service, video_id, provider }: GetSubtitleOpts) {
    const query = db
      .selectFrom(this.dbName)
      .where("service", "=", service)
      .where("video_id", "=", video_id)
      .where("provider", "=", provider);

    return await query.selectAll().execute();
  }

  async getById(id: number) {
    const query = db.selectFrom(this.dbName).where("id", "=", id);

    return await query.selectAll().executeTakeFirst();
  }

  async getAll(
    criteria: Partial<Subtitle> = {},
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

    if (criteria.provider) {
      query = query.where("provider", "=", criteria.provider);
    }

    if (criteria.lang) {
      query = query.where("lang", "=", criteria.lang);
    }

    if (criteria.lang_from) {
      query = query.where("lang_from", "=", criteria.lang_from);
    }

    if (criteria.subtitle_url !== undefined) {
      query = query.where(
        "subtitle_url",
        criteria.subtitle_url === null ? "is" : "=",
        criteria.subtitle_url,
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

  async update(id: number, updateWith: SubtitleUpdate) {
    await db.updateTable(this.dbName).set(updateWith).where("id", "=", id).execute();
  }

  async create(subtitle: NewSubtitle) {
    return await db
      .insertInto(this.dbName)
      .values(subtitle)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteById(id: number) {
    return await db.deleteFrom(this.dbName).where("id", "=", id).returningAll().executeTakeFirst();
  }

  async massDelete(criteria: Partial<MassDeleteSubtitleOpts> = {}) {
    let query = db.deleteFrom(this.dbName);
    if (criteria.service) {
      query = query.where("service", "=", criteria.service);
    }

    if (criteria.provider) {
      query = query.where("provider", "=", criteria.provider);
    }

    if (criteria.lang_from) {
      query = query.where("lang_from", "=", criteria.lang_from);
    }

    if (criteria.lang) {
      query = query.where("lang", "=", criteria.lang);
    }

    if (criteria.created_before) {
      query = query.where("created_at", "<", criteria.created_before);
    }

    return await query.returningAll().execute();
  }
}
