import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("vot_subtitles")
    .addColumn("id", "integer", (col) => col.generatedAlwaysAsIdentity().primaryKey())
    .addColumn("service", "varchar", (col) => col.notNull())
    .addColumn("video_id", "varchar", (col) => col.notNull())
    .addColumn("provider", "varchar", (col) => col.notNull())
    .addColumn("lang", "varchar", (col) => col.notNull())
    .addColumn("lang_from", "varchar")
    .addColumn("subtitle_url", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createIndex("vot_subtitles_get_item")
    .on("vot_subtitles")
    .columns(["service", "video_id", "provider", "lang"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("vot_subtitles_get_item").execute();
  await db.schema.dropTable("vot_subtitles").execute();
}
